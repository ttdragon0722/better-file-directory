import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
// 引入 interface
import { getHtmlForWebview, getMaterialIconUrl, IconConfig } from './view';

const viewType = 'betterFileDirectory';
let clipboardSourcePath: string | undefined = undefined;

export function activate(context: vscode.ExtensionContext) {
  // *** 關鍵修改：將 context 傳入 Serializer ***
  context.subscriptions.push(
    vscode.window.registerWebviewPanelSerializer(viewType, new BetterFileDirectorySerializer(context))
  );

  let currentCmd = vscode.commands.registerCommand('better-file-directory.current', async () => {
    let targetUri = vscode.workspace.workspaceFolders?.[0]?.uri || vscode.Uri.file(os.homedir());
    createPanel(context, targetUri);
  });

  let openCmd = vscode.commands.registerCommand('better-file-directory.open', async () => {
    const folders = await vscode.window.showOpenDialog({
      canSelectFiles: false, canSelectFolders: true, openLabel: 'Select Folder'
    });
    if (folders?.[0]) createPanel(context, folders[0]);
  });

  context.subscriptions.push(currentCmd, openCmd);
}

// *** 修改：加入 viewColumn 參數 (預設為 Active) ***
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

      case 'chooseFolder':
        // 1. 跳出 VS Code 原生選擇視窗
        const folders = await vscode.window.showOpenDialog({
            canSelectFiles: false,
            canSelectFolders: true,
            openLabel: 'Select Folder'
        });

        // 2. 如果使用者有選資料夾
        if (folders && folders[0]) {
            const selectedFolder = folders[0];
            
            // 3. 更新 Title
            panel.title = `📂 ${path.basename(selectedFolder.fsPath)}`;
            
            // 4. *** 這裡就是共用邏輯 ***
            // 我們呼叫跟 openPath 一樣的函式來更新畫面
            await updateWebviewContent(panel, selectedFolder);
        }
        break;

      // *** 新增：處理 Split 指令 ***
      case 'split':
        if (message.path) {
            // 在旁邊開啟一個新的 Panel，顯示相同的路徑
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

// ... (New File/Folder/Delete/Rename/Copy functions remain the same) ...
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

// 序列化器
class BetterFileDirectorySerializer implements vscode.WebviewPanelSerializer {
  // 接收 context
  constructor(private context: vscode.ExtensionContext) {}

  async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
    const folderPath = state?.path || os.homedir();
    
    webviewPanel.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.file(path.parse(folderPath).root)]
    };
    
    // 正確傳遞 context，這樣恢復的視窗也能正常運作
    handleWebviewMessage(webviewPanel, this.context); 
    
    await updateWebviewContent(webviewPanel, vscode.Uri.file(folderPath));
  }
}

async function updateWebviewContent(panel: vscode.WebviewPanel, folderUri: vscode.Uri) {
  try {
    const result = await vscode.workspace.fs.readDirectory(folderUri);
    const config = vscode.workspace.getConfiguration('better-file-directory');
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