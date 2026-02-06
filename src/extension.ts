import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
// 引入 interface
import { getHtmlForWebview, getMaterialIconUrl, IconConfig } from './view';

const viewType = 'betterFileDirectory';
let clipboardSourcePath: string | undefined = undefined;
const panelPaths = new WeakMap<vscode.WebviewPanel, string>();
let activePanel: vscode.WebviewPanel | undefined = undefined;

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.window.registerWebviewPanelSerializer(viewType, new BetterFileDirectorySerializer(context))
  );
  let revealInOSCmd = vscode.commands.registerCommand('better-file-directory.revealCurrentInOS', async () => {
    
    let targetPath: string | undefined;

    // 邏輯判斷：
    // 1. 如果 Webview 是「正如火如荼使用中 (Focused/Active)」，代表使用者是點擊「Webview 標題列」上的按鈕
    //    這時我們應該開啟 Webview 裡面的路徑。
    if (activePanel && activePanel.active && panelPaths.has(activePanel)) {
        targetPath = panelPaths.get(activePanel);
    } 
    
    // 2. 如果 Webview 不是焦點 (例如使用者點擊了側邊欄 Explorer)，
    //    或者根本沒有 Webview，則預設開啟「工作區根目錄 (Workspace Root)」。
    if (!targetPath) {
        if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
            targetPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
        }
    }

    // 執行開啟動作
    if (targetPath) {
        await vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(targetPath));
    } else {
        vscode.window.showWarningMessage('No folder or workspace is currently open.');
    }
  });

  // *** 修改：增強版 current 指令 ***
  // 1. 支援右鍵選單傳入 uri
  // 2. 支援多工作區選擇 (Multi-root Workspaces)
  let currentCmd = vscode.commands.registerCommand('better-file-directory.current', async (uri?: vscode.Uri) => {
    let targetUri: vscode.Uri | undefined;

    if (uri && uri instanceof vscode.Uri) {
        // 情境 A: 從側邊欄檔案總管按右鍵觸發 -> 直接開啟選中的資料夾
        targetUri = uri;
    } else {
        // 情境 B: 從標題列按鈕或 Command Palette 觸發
        const workspaceFolders = vscode.workspace.workspaceFolders;

        if (!workspaceFolders || workspaceFolders.length === 0) {
            // 沒有開啟任何資料夾 -> 預設開啟家目錄
            targetUri = vscode.Uri.file(os.homedir());
        } else if (workspaceFolders.length === 1) {
            // 只有一個工作區 -> 直接開啟
            targetUri = workspaceFolders[0].uri;
        } else {
            // 多個工作區 -> 跳出選單讓使用者選擇
            const items = workspaceFolders.map(folder => ({
                label: `$(root-folder) ${folder.name}`,
                description: folder.uri.fsPath,
                uri: folder.uri
            }));

            const selected = await vscode.window.showQuickPick(items, {
                placeHolder: 'Select a workspace folder to view'
            });

            if (selected) {
                targetUri = selected.uri;
            }
        }
    }

    if (targetUri) {
        createPanel(context, targetUri);
    }
  });

  let openCmd = vscode.commands.registerCommand('better-file-directory.open', async (arg?: vscode.Uri | string) => {
    let targetUri: vscode.Uri | undefined;

    if (arg instanceof vscode.Uri) {
        targetUri = arg;
    } else if (typeof arg === 'string') {
        targetUri = vscode.Uri.file(arg);
    } else {
        const folders = await vscode.window.showOpenDialog({
            canSelectFiles: false, canSelectFolders: true, openLabel: 'Select Folder'
        });
        if (folders?.[0]) targetUri = folders[0];
    }

    if (targetUri) {
        createPanel(context, targetUri);
    }
  });

  // 開啟常用資料夾指令
  let openFavCmd = vscode.commands.registerCommand('better-file-directory.openFavorite', async () => {
    const config = vscode.workspace.getConfiguration('better-file-directory');
    
    // 讀取設定 (Map 格式: { "Label": "Path" })
    const favorites = config.get<{[key: string]: string}>('favoriteFolders') || {};
    
    // 將 Object 轉為 QuickPick 項目
    const items = Object.keys(favorites).map(label => ({
        label: `$(star) ${label}`,
        description: favorites[label],
        path: favorites[label]
    }));

    if (items.length === 0) {
        const choice = await vscode.window.showInformationMessage(
            'No favorite folders configured yet.', 
            'Add Favorite',
            'Cancel'
        );
        if (choice === 'Add Favorite') {
            vscode.commands.executeCommand('better-file-directory.addFavorite');
        }
        return;
    }

    const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select a favorite folder to open'
    });

    if (selected && selected.path) {
        createPanel(context, vscode.Uri.file(selected.path));
    }
  });

  // 加入常用資料夾指令
  let addFavCmd = vscode.commands.registerCommand('better-file-directory.addFavorite', async (uri?: vscode.Uri) => {
    let targetPath = '';
    let defaultLabel = '';

    if (uri && uri.fsPath) {
        targetPath = uri.fsPath;
        defaultLabel = path.basename(targetPath);
    } else {
        const folders = await vscode.window.showOpenDialog({
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false,
            openLabel: 'Select Folder to Favorite'
        });
        if (!folders || folders.length === 0) return;
        targetPath = folders[0].fsPath;
        defaultLabel = path.basename(targetPath);
    }

    const label = await vscode.window.showInputBox({
        prompt: 'Enter a name for this favorite folder',
        placeHolder: 'e.g. My Project',
        value: defaultLabel
    });

    if (!label) return;

    try {
        const config = vscode.workspace.getConfiguration('better-file-directory');
        
        // 1. 取得目前的物件設定 (Map)
        const currentFavorites = { ...config.get<{[key: string]: string}>('favoriteFolders') };
        
        // 2. 直接以 Key-Value 方式新增或更新
        currentFavorites[label] = targetPath;

        // 3. 寫入設定
        await config.update('favoriteFolders', currentFavorites, vscode.ConfigurationTarget.Global);
        
        const selection = await vscode.window.showInformationMessage(
            `Folder '${label}' added to favorites!`,
            'Open Now'
        );

        if (selection === 'Open Now') {
            createPanel(context, vscode.Uri.file(targetPath));
        }

    } catch (error) {
        vscode.window.showErrorMessage(`Failed to save favorite: ${error}`);
    }
  });

  context.subscriptions.push(currentCmd, openCmd, openFavCmd, addFavCmd,revealInOSCmd);
}

function createPanel(context: vscode.ExtensionContext, folderUri: vscode.Uri, viewColumn: vscode.ViewColumn = vscode.ViewColumn.Active) {
  const panel = vscode.window.createWebviewPanel(
    viewType,
    `📂 ${path.basename(folderUri.fsPath)}`,
    viewColumn, 
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [vscode.Uri.file(path.parse(folderUri.fsPath).root)]
    }
  );
  
  panel.iconPath = new vscode.ThemeIcon('folder-opened');

  handleWebviewMessage(panel, context);
  updateWebviewContent(panel, folderUri);
}

function handleWebviewMessage(panel: vscode.WebviewPanel, context: vscode.ExtensionContext) {
  panel.webview.onDidReceiveMessage(async message => {
    switch (message.command) {
      case 'openPath':
        const targetPath = vscode.Uri.file(message.path);
        if (message.isDirectory) {
          panel.title = `📂 ${path.basename(targetPath.fsPath)}`;
          await updateWebviewContent(panel, targetPath);
        } else {
          vscode.commands.executeCommand('vscode.open', targetPath, { viewColumn: vscode.ViewColumn.Active });
        }
        break;

      case 'split':
        if (message.path) {
            createPanel(context, vscode.Uri.file(message.path), vscode.ViewColumn.Beside);
        }
        break;

      case 'copy':
        if (message.path) {
          clipboardSourcePath = message.path;
          vscode.window.setStatusBarMessage(`Copied: ${path.basename(message.path)}`, 3000);
        }
        break;

      case 'paste':
        if (clipboardSourcePath && message.targetFolder) {
          await performCopy(clipboardSourcePath, message.targetFolder, panel);
        } else {
          vscode.window.showWarningMessage('Clipboard is empty.');
        }
        break;

      case 'dropFile':
        if (message.source && message.targetFolder) {
           await performCopy(message.source, message.targetFolder, panel);
        }
        break;

      case 'rename':
        if (message.path) {
           await performRename(message.path, panel);
        }
        break;

      case 'delete':
        if (message.path) {
            await performDelete(message.path, panel);
        }
        break;
      
      case 'newFile':
        if (message.path) {
            await performNewFile(message.path, panel);
        }
        break;
      
      case 'newFolder':
        if (message.path) {
            await performNewFolder(message.path, panel);
        }
        break;
    }
  });
}

// ... 輔助功能區 (New File/Folder/Delete/Rename/Copy) 保持不變 ...
async function performNewFile(folderPath: string, panel: vscode.WebviewPanel) {
    try {
        const fileName = await vscode.window.showInputBox({ placeHolder: 'New File Name', prompt: 'Enter the name of the new file' });
        if (!fileName) return;
        const targetUri = vscode.Uri.joinPath(vscode.Uri.file(folderPath), fileName);
        try { await vscode.workspace.fs.stat(targetUri); vscode.window.showErrorMessage(`File '${fileName}' already exists.`); return; } catch {
            await vscode.workspace.fs.writeFile(targetUri, new Uint8Array());
            await updateWebviewContent(panel, vscode.Uri.file(folderPath));
        }
    } catch (error) { vscode.window.showErrorMessage(`Failed to create file: ${error}`); }
}

async function performNewFolder(folderPath: string, panel: vscode.WebviewPanel) {
    try {
        const folderName = await vscode.window.showInputBox({ placeHolder: 'New Folder Name', prompt: 'Enter the name of the new folder' });
        if (!folderName) return;
        const targetUri = vscode.Uri.joinPath(vscode.Uri.file(folderPath), folderName);
        try { await vscode.workspace.fs.stat(targetUri); vscode.window.showErrorMessage(`Folder '${folderName}' already exists.`); return; } catch {
            await vscode.workspace.fs.createDirectory(targetUri);
            await updateWebviewContent(panel, vscode.Uri.file(folderPath));
        }
    } catch (error) { vscode.window.showErrorMessage(`Failed to create folder: ${error}`); }
}

async function performDelete(sourcePath: string, panel: vscode.WebviewPanel) {
    try {
        const uri = vscode.Uri.file(sourcePath);
        const fileName = path.basename(sourcePath);
        const answer = await vscode.window.showWarningMessage(`Are you sure you want to delete '${fileName}'?`, { modal: true }, 'Move to Trash');
        if (answer === 'Move to Trash') {
            await vscode.workspace.fs.delete(uri, { useTrash: true, recursive: true });
            const folderPath = path.dirname(sourcePath);
            await updateWebviewContent(panel, vscode.Uri.file(folderPath));
        }
    } catch (error) { vscode.window.showErrorMessage(`Delete failed: ${error}`); }
}

async function performRename(sourcePath: string, panel: vscode.WebviewPanel) {
    try {
        const sourceUri = vscode.Uri.file(sourcePath);
        const oldName = path.basename(sourcePath);
        const folderPath = path.dirname(sourcePath);
        const newName = await vscode.window.showInputBox({ prompt: `Rename ${oldName} to...`, value: oldName, valueSelection: [0, oldName.lastIndexOf('.')] });
        if (!newName || newName === oldName) return;
        const targetUri = vscode.Uri.joinPath(vscode.Uri.file(folderPath), newName);
        await vscode.workspace.fs.rename(sourceUri, targetUri, { overwrite: false });
        await updateWebviewContent(panel, vscode.Uri.file(folderPath));
    } catch (error) { vscode.window.showErrorMessage(`Rename failed: ${error}`); }
}

async function performCopy(sourcePath: string, targetFolder: string, panel: vscode.WebviewPanel) {
    try {
        const sourceUri = vscode.Uri.file(sourcePath);
        const fileName = path.basename(sourcePath);
        let targetUri = vscode.Uri.joinPath(vscode.Uri.file(targetFolder), fileName);
        if (sourceUri.fsPath === targetUri.fsPath) {
             const namePart = path.parse(fileName).name;
             const extPart = path.parse(fileName).ext;
             targetUri = vscode.Uri.joinPath(vscode.Uri.file(targetFolder), `${namePart}_copy${extPart}`);
        }
        await vscode.workspace.fs.copy(sourceUri, targetUri, { overwrite: false });
        vscode.window.showInformationMessage(`Copied to ${path.basename(targetUri.fsPath)}`);
        await updateWebviewContent(panel, vscode.Uri.file(targetFolder));
    } catch (error) { vscode.window.showErrorMessage(`Paste failed: ${error}`); }
}

class BetterFileDirectorySerializer implements vscode.WebviewPanelSerializer {
  constructor(private context: vscode.ExtensionContext) {}

  async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
    const folderPath = state?.path || os.homedir();
    
    webviewPanel.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.file(path.parse(folderPath).root)]
    };
    
    handleWebviewMessage(webviewPanel, this.context); 
    await updateWebviewContent(webviewPanel, vscode.Uri.file(folderPath));
  }
}

// *** 關鍵修改：以 Object (Map) 形式讀取設定 ***
async function updateWebviewContent(panel: vscode.WebviewPanel, folderUri: vscode.Uri) {
  try {
    const result = await vscode.workspace.fs.readDirectory(folderUri);
    const config = vscode.workspace.getConfiguration('better-file-directory');
    
    // 直接讀取 Object，無需再從陣列轉換
    const iconConfig: IconConfig = {
        customFolderIcons: config.get('customFolderIcons') || {},
        customFileIcons: config.get('customFileIcons') || {},
        customExtensionIcons: config.get('customExtensionIcons') || {}
    };

    const files = result.map(([name, type]) => {
      const isDirectory = type === vscode.FileType.Directory;
      const isImage = /\.(png|jpg|jpeg|gif|webp|svg|ico)$/i.test(name);
      const filePath = vscode.Uri.joinPath(folderUri, name);
      const webviewUri = panel.webview.asWebviewUri(filePath).toString();
      const fsPath = filePath.fsPath;
      const iconUrl = getMaterialIconUrl(name, isDirectory, iconConfig);
      return { name, isDirectory, isImage, webviewUri, fsPath, iconUrl };
    });

    files.sort((a, b) => (a.isDirectory === b.isDirectory ? 0 : a.isDirectory ? -1 : 1));
    panel.webview.html = getHtmlForWebview(files, folderUri.fsPath);
  } catch (error) { vscode.window.showErrorMessage(`讀取失敗: ${error}`); }
}