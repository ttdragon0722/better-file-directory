import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
// 匯入分離出去的 View 邏輯
import { getHtmlForWebview, getMaterialIconUrl } from './view';

const viewType = 'betterFileDirectory';

// 全域變數用來儲存剪貼簿 (Ctrl+C) 的路徑
let clipboardSourcePath: string | undefined = undefined;

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.window.registerWebviewPanelSerializer(viewType, new BetterFileDirectorySerializer())
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

function createPanel(context: vscode.ExtensionContext, folderUri: vscode.Uri) {
  const panel = vscode.window.createWebviewPanel(
    viewType,
    `📂 ${path.basename(folderUri.fsPath)}`,
    vscode.ViewColumn.Active, 
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

      // *** 新增：處理重新命名 (F2) ***
      case 'rename':
        if (message.path) {
           await performRename(message.path, panel);
        }
        break;
    }
  });
}

// *** 新增：重新命名邏輯 ***
async function performRename(sourcePath: string, panel: vscode.WebviewPanel) {
    try {
        const sourceUri = vscode.Uri.file(sourcePath);
        const oldName = path.basename(sourcePath);
        const folderPath = path.dirname(sourcePath);

        // 跳出輸入框讓使用者輸入新名稱
        const newName = await vscode.window.showInputBox({
            prompt: `Rename ${oldName} to...`,
            value: oldName,
            valueSelection: [0, oldName.lastIndexOf('.')] // 自動選取副檔名以前的文字
        });

        if (!newName || newName === oldName) {
            return; // 使用者取消或名稱未變
        }

        const targetUri = vscode.Uri.joinPath(vscode.Uri.file(folderPath), newName);
        
        // 執行重新命名
        await vscode.workspace.fs.rename(sourceUri, targetUri, { overwrite: false });
        
        // 重新整理 Webview
        await updateWebviewContent(panel, vscode.Uri.file(folderPath));

    } catch (error) {
        vscode.window.showErrorMessage(`Rename failed: ${error}`);
    }
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

    } catch (error) {
        vscode.window.showErrorMessage(`Paste failed: ${error}`);
    }
}

class BetterFileDirectorySerializer implements vscode.WebviewPanelSerializer {
  async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
    const folderPath = state?.path || os.homedir();
    webviewPanel.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.file(path.parse(folderPath).root)]
    };
    handleWebviewMessage(webviewPanel, undefined as any); 
    await updateWebviewContent(webviewPanel, vscode.Uri.file(folderPath));
  }
}

async function updateWebviewContent(panel: vscode.WebviewPanel, folderUri: vscode.Uri) {
  try {
    const result = await vscode.workspace.fs.readDirectory(folderUri);
    
    const files = result.map(([name, type]) => {
      const isDirectory = type === vscode.FileType.Directory;
      const isImage = /\.(png|jpg|jpeg|gif|webp|svg|ico)$/i.test(name);
      const filePath = vscode.Uri.joinPath(folderUri, name);
      const webviewUri = panel.webview.asWebviewUri(filePath).toString();
      const fsPath = filePath.fsPath;
      
      const iconUrl = getMaterialIconUrl(name, isDirectory);

      return { name, isDirectory, isImage, webviewUri, fsPath, iconUrl };
    });

    files.sort((a, b) => (a.isDirectory === b.isDirectory ? 0 : a.isDirectory ? -1 : 1));

    panel.webview.html = getHtmlForWebview(files, folderUri.fsPath);

  } catch (error) {
    vscode.window.showErrorMessage(`讀取失敗: ${error}`);
  }
}