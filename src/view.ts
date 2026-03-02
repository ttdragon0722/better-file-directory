import * as path from 'path';

// 黃色資料夾 Base64
const DEFAULT_FOLDER_ICON = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI0ZGQ0EyOCIgZD0iTTEwIDRINGMtMS4xIDAtMS45OS45LTEuOTkgMkwyIDE4YzAgMS4xLjkgMiAyIDJoMTZjMS4xIDAgMi0uOSAyLTJWOGMwLTEuMS0uOS0yLTItMmgtOGwtMi0yeiIvPjwvc3ZnPg==";
const ICON_BASE_URL = 'https://raw.githubusercontent.com/PKief/vscode-material-icon-theme/main/icons/';

export interface IconConfig {
    customFolderIcons: { [key: string]: string };
    customFileIcons: { [key: string]: string };
    customExtensionIcons: { [key: string]: string };
}

export function getMaterialIconUrl(filename: string, isDirectory: boolean, config?: IconConfig): string {
  if (isDirectory) {
    const defaultFolderMap: {[key: string]: string} = {
      'src': 'folder-src', 'dist': 'folder-dist', 'out': 'folder-dist',
      'node_modules': 'folder-node', '.git': 'folder-git', '.github': 'folder-github',
      'components': 'folder-components', 'utils': 'folder-utils', 'public': 'folder-public',
      'assets': 'folder-assets', 'images': 'folder-images', 'img': 'folder-images',
      'test': 'folder-test', 'tests': 'folder-test', 'styles': 'folder-css',
      '.vscode': 'folder-vscode', 'include': 'folder-include', 'lib': 'folder-lib', 
      'packages': 'folder-packages', 'temp': 'folder-temp', 'tmp': 'folder-temp'
    };
    const folderMap = { ...defaultFolderMap, ...(config?.customFolderIcons || {}) };
    const iconName = folderMap[filename.toLowerCase()];
    return iconName ? `${ICON_BASE_URL}${iconName}.svg` : DEFAULT_FOLDER_ICON;
  }

  let ext = path.extname(filename).toLowerCase().replace('.', '');
  const fileNameLower = filename.toLowerCase();

  const defaultFileMap: {[key: string]: string} = {
    'package.json': 'nodejs', 'package-lock.json': 'nodejs', 'yarn.lock': 'yarn',
    'tsconfig.json': 'tsconfig', 'jsconfig.json': 'javascript',
    'readme.md': 'readme', 'license': 'license', 'license.txt': 'license',
    'dockerfile': 'docker', '.gitignore': 'git', '.gitattributes': 'git',
    '.env': 'tune', '.env.local': 'tune', 'favicon.ico': 'favicon'
  };
  const fileMap = { ...defaultFileMap, ...(config?.customFileIcons || {}) };
  if (fileMap[fileNameLower]) return `${ICON_BASE_URL}${fileMap[fileNameLower]}.svg`;

  const defaultExtMap: {[key: string]: string} = {
    'ts': 'typescript', 'tsx': 'react_ts', 'js': 'javascript', 'jsx': 'react', 'mjs': 'javascript',
    'py': 'python', 'pip': 'python', 'html': 'html', 'htm': 'html',
    'css': 'css', 'scss': 'sass', 'sass': 'sass', 'less': 'less',
    'json': 'json', 'tsbuildinfo': 'json', 'md': 'markdown', 'mdx': 'markdown',
    'xml': 'xml', 'yaml': 'yaml', 'yml': 'yaml',
    'java': 'java', 'class': 'java', 'jar': 'java',
    'c': 'c', 'h': 'c', 'cpp': 'cpp', 'hpp': 'cpp', 'cs': 'csharp', 'go': 'go',
    'php': 'php', 'rb': 'ruby', 'rs': 'rust',
    'sql': 'database', 'prisma': 'database',
    'zip': 'zip', 'tar': 'zip', 'gz': 'zip', '7z': 'zip', 'rar': 'zip', 'pdf': 'pdf',
    'txt': 'document', 'log': 'document', 'ini': 'settings', 'config': 'settings',
    'vue': 'vue', 'svelte': 'svelte', 'astro': 'astro',
    'sh': 'console', 'bash': 'console', 'zsh': 'console', 'bat': 'console', 'cmd': 'console',
    'svg': 'svg', 'png': 'image', 'jpg': 'image', 'jpeg': 'image', 'gif': 'image', 'webp': 'image', 'ico': 'image'
  };
  const extMap = { ...defaultExtMap, ...(config?.customExtensionIcons || {}) };
  const iconName = extMap[ext] || 'document'; 
  return `${ICON_BASE_URL}${iconName}.svg`;
}
export function getHtmlForWebview(files: any[], currentPath: string): string {
  // 處理路徑分隔符號
  const sep = currentPath.includes('\\') ? '\\' : '/'; 
  const segments = currentPath.split(sep).filter(s => s.length > 0);
  let accumulatedPath = currentPath.startsWith(sep) ? sep : ''; 
  
  // 產生麵包屑 HTML
  const breadcrumbsHtml = segments.map((segment, index) => {
    if (index === 0 && currentPath.includes(':')) { accumulatedPath += segment; } 
    else { accumulatedPath = index === 0 && !currentPath.includes(':') ? accumulatedPath + segment : accumulatedPath + sep + segment; }
    const safePath = accumulatedPath.replace(/\\/g, '\\\\');
    return `<span class="chip" onclick="handleCardClick('${safePath}', true)">${segment}</span>`;
  }).join('<span class="divider">/</span>');

  // 產生檔案卡片 HTML
  const cardsHtml = files.map((file: any, index: number) => {
    let iconHtml = '';
    const fallbackIcon = file.isDirectory ? DEFAULT_FOLDER_ICON : `${ICON_BASE_URL}document.svg`;

    if (file.isImage) {
      iconHtml = `<img src="${file.webviewUri}" class="thumbnail" loading="lazy" draggable="false" onerror="this.onerror=null;this.src='${fallbackIcon}';" />`;
    } else {
      iconHtml = `<img src="${file.iconUrl}" class="icon-svg" loading="lazy" draggable="false" onerror="this.onerror=null;this.src='${fallbackIcon}';" />`;
    }

    const safePath = file.fsPath.replace(/\\/g, '\\\\');
    const safeName = file.name.replace(/"/g, '&quot;');
    // 【新增】確保傳入的 file 物件裡有時間屬性（如 mtimeMs），若無則預設為 0
    const timeValue = file.mtimeMs || file.time || 0; 
    
    return `
      <div class="card" 
           draggable="true"
           data-index="${index}" 
           data-path="${safePath}" 
           data-isdir="${file.isDirectory}"
           data-name="${safeName}"
           data-time="${timeValue}">
        <div class="card-preview">${iconHtml}</div>
        <div class="card-name" title="${file.name}">${file.name}</div>
      </div>
    `;
  }).join('');

  // 回傳完整的 HTML
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src 'self' data: https: vscode-resource: vscode-webview-resource:;">

    <style>
      html, body { height: 100%; margin: 0; padding: 0; }
      body { font-family: var(--vscode-font-family); background-color: var(--vscode-editor-background); color: var(--vscode-editor-foreground); padding: 20px; user-select: none; overflow-y: auto; height: 100vh; box-sizing: border-box; }
      
      /* Context Menu Style */
      .context-menu {
        display: none;
        position: absolute;
        z-index: 1000;
        background-color: var(--vscode-menu-background);
        color: var(--vscode-menu-foreground);
        border: 1px solid var(--vscode-menu-border);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        border-radius: 4px;
        padding: 4px 0;
        min-width: 160px;
      }
      .context-menu-item {
        padding: 6px 16px;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        font-size: 13px;
      }
      .context-menu-item:hover {
        background-color: var(--vscode-menu-selectionBackground);
        color: var(--vscode-menu-selectionForeground);
      }
      .context-menu-separator {
        height: 1px;
        background-color: var(--vscode-menu-separatorBackground);
        margin: 4px 0;
      }
      .shortcut { opacity: 0.7; font-size: 12px; }

      /* 【新增】頂部 Header 容器，讓麵包屑和排序選單並排 */
      .header-container { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid var(--vscode-panel-border); }
      .breadcrumbs { display: flex; flex-wrap: wrap; align-items: center; font-size: 14px; }
      
      /* 【新增】排序選單樣式 */
      .sort-select { background-color: var(--vscode-dropdown-background); color: var(--vscode-dropdown-foreground); border: 1px solid var(--vscode-dropdown-border); border-radius: 4px; padding: 4px 8px; font-size: 13px; cursor: pointer; outline: none; }
      
      .chip { background-color: var(--vscode-badge-background); color: var(--vscode-badge-foreground); padding: 4px 12px; border-radius: 16px; cursor: pointer; transition: opacity 0.2s; margin: 2px; }
      .chip:hover { opacity: 0.8; }
      .divider { margin: 0 5px; color: var(--vscode-descriptionForeground); }
      
      .grid-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 15px; padding-bottom: 20px; }
      
      .card { background-color: var(--vscode-editor-inactiveSelectionBackground); border-radius: 8px; padding: 10px; height: 140px; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; cursor: pointer; border: 2px solid transparent; overflow: hidden; }
      .card:hover { background-color: var(--vscode-list-hoverBackground); transform: translateY(-2px); transition: transform 0.1s; }
      .card.focused { border-color: var(--vscode-focusBorder); background-color: var(--vscode-list-activeSelectionBackground); color: var(--vscode-list-activeSelectionForeground); }
      .card.dragging { opacity: 0.5; border: 2px dashed var(--vscode-focusBorder); }
      
      body.drag-over { background-color: var(--vscode-editor-selectionBackground); }
      .card-preview { height: 90px; width: 100%; display: flex; align-items: center; justify-content: center; overflow: hidden; margin-bottom: 8px; flex-shrink: 0; }
      .icon-svg { width: 56px; height: 56px; object-fit: contain; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.2)); }
      .thumbnail { width: 100%; height: 100%; object-fit: contain; object-position: center; }
      .card-name { font-size: 13px; text-align: center; width: 100%; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; word-break: break-word; line-height: 1.2; }
    </style>
  </head>
  <body>
    <div id="context-menu" class="context-menu">
      <div class="context-menu-item" id="ctx-new-file">New File...</div>
      <div class="context-menu-item" id="ctx-new-folder">New Folder...</div>
      <div class="context-menu-separator"></div>
      <div class="context-menu-item" id="ctx-open">Open <span class="shortcut">Enter</span></div>
      <div class="context-menu-separator"></div>
      <div class="context-menu-item" id="ctx-copy">Copy <span class="shortcut">Ctrl+C</span></div>
      <div class="context-menu-item" id="ctx-paste">Paste <span class="shortcut">Ctrl+V</span></div>
      <div class="context-menu-separator"></div>
      <div class="context-menu-item" id="ctx-rename">Rename <span class="shortcut">F2</span></div>
      <div class="context-menu-item" id="ctx-delete" style="color: var(--vscode-errorForeground);">Delete <span class="shortcut">Del</span></div>
    </div>

    <div class="header-container">
      <div class="breadcrumbs">
         <span id="root-folder-btn" style="margin-right: 10px; cursor: pointer;" title="Switch Folder">📂</span>
         ${breadcrumbsHtml}
      </div>
      <select id="sort-select" class="sort-select">
        <option value="default">Default (A-Z)</option>
        <option value="time">Last Modified</option>
      </select>
    </div>

    <div class="grid-container" id="grid">${cardsHtml}</div>
    
    <script>
      const vscode = acquireVsCodeApi();
      const currentPath = '${currentPath.replace(/\\/g, '\\\\')}';
      
      // 取回之前的排序狀態 (如果有)
      const state = vscode.getState() || { path: currentPath, sortMethod: 'default' };
      vscode.setState(state);
      
      let focusedIndex = -1;
      let contextMenuTargetIndex = -1;

      // 【修改】因為排序會改變 cards 順序，所以使用 let
      let cards = document.querySelectorAll('.card');
      const grid = document.getElementById('grid');
      const contextMenu = document.getElementById('context-menu');
      const sortSelect = document.getElementById('sort-select');

      // 初始化選單狀態
      sortSelect.value = state.sortMethod;

      function handleCardClick(path, isDirectory) {
        vscode.postMessage({ command: 'openPath', path: path, isDirectory: isDirectory });
      }

      function updateFocus() {
        cards.forEach((card, index) => {
          if (index === focusedIndex) {
            card.classList.add('focused');
            if (event && event.type === 'keydown') {
                card.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
          } else { card.classList.remove('focused'); }
        });
      }
      
      function getColumnsCount() {
        if (cards.length < 2) return 1;
        if (cards[0].offsetTop < cards[1].offsetTop) return 1;
        let cols = 0; let topY = cards[0].offsetTop;
        for(let i=0; i<cards.length; i++) { if(cards[i].offsetTop > topY) break; cols++; }
        return cols;
      }

      // 【新增】排序邏輯
      function sortCards(method) {
        const cardsArray = Array.from(cards);
        
        cardsArray.sort((a, b) => {
          const isDirA = a.dataset.isdir === 'true';
          const isDirB = b.dataset.isdir === 'true';
          
          // 資料夾永遠優先在前面
          if (isDirA !== isDirB) {
            return isDirA ? -1 : 1;
          }

          if (method === 'time') {
            const timeA = parseFloat(a.dataset.time) || 0;
            const timeB = parseFloat(b.dataset.time) || 0;
            return timeB - timeA; // 數字越大(時間越新)排越前面
          } else {
            // 預設按名稱 A-Z
            return a.dataset.name.localeCompare(b.dataset.name);
          }
        });

        // 清空容器後依新順序加回去
        grid.innerHTML = '';
        cardsArray.forEach((card, newIndex) => {
          card.dataset.index = newIndex; // 更新 index 以防鍵盤導覽亂跳
          grid.appendChild(card);
        });

        // 重新抓取更新後的元素列表
        cards = document.querySelectorAll('.card');
        focusedIndex = -1;
        updateFocus();

        // 存下使用者選擇的排序方式
        vscode.setState({ ...vscode.getState(), sortMethod: method });
      }

      // 綁定排序選單事件
      sortSelect.addEventListener('change', (e) => {
        sortCards(e.target.value);
      });

      // 如果有存下來的排序偏好，載入時自動排一次
      if (state.sortMethod !== 'default') {
         sortCards(state.sortMethod);
      }

      // --- 事件綁定 ---
      // (這裡因為可能重新排序，使用事件委派或者重新綁定。為求穩定，不更動原邏輯，
      // 但建議在外層用 grid.addEventListener('click', ...) 做事件委派會更優雅，目前依原寫法不變)
      cards.forEach((card, index) => {
          card.addEventListener('click', () => {
              focusedIndex = parseInt(card.dataset.index);
              updateFocus();
          });
          card.addEventListener('dblclick', () => {
              handleCardClick(card.dataset.path, card.dataset.isdir === 'true');
          });
          card.addEventListener('dragstart', (e) => {
              e.dataTransfer.setData('text/plain', card.dataset.path);
              e.dataTransfer.effectAllowed = 'copy';
              card.classList.add('dragging');
              focusedIndex = parseInt(card.dataset.index);
              updateFocus();
          });
          card.addEventListener('dragend', (e) => {
              card.classList.remove('dragging');
          });
          card.addEventListener('contextmenu', (e) => {
              e.preventDefault();
              e.stopPropagation(); 
              focusedIndex = parseInt(card.dataset.index);
              contextMenuTargetIndex = parseInt(card.dataset.index);
              updateFocus();
              showContextMenu(e.clientX, e.clientY, true);
          });
      });

      document.body.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          contextMenuTargetIndex = -1; 
          showContextMenu(e.clientX, e.clientY, false);
      });

      document.addEventListener('click', () => {
          contextMenu.style.display = 'none';
      });

      function showContextMenu(x, y, hasTarget) {
          contextMenu.style.display = 'block';
          contextMenu.style.left = x + 'px';
          contextMenu.style.top = y + 'px';
          document.getElementById('ctx-new-file').style.display = hasTarget ? 'none' : 'flex';
          document.getElementById('ctx-new-folder').style.display = hasTarget ? 'none' : 'flex';
          document.getElementById('ctx-open').style.display = hasTarget ? 'flex' : 'none';
          document.getElementById('ctx-copy').style.display = hasTarget ? 'flex' : 'none';
          document.getElementById('ctx-rename').style.display = hasTarget ? 'flex' : 'none';
          document.getElementById('ctx-delete').style.display = hasTarget ? 'flex' : 'none';
          document.getElementById('ctx-paste').style.display = 'flex';
      }

      // Context menu 操作
      document.getElementById('ctx-new-file').addEventListener('click', () => vscode.postMessage({ command: 'newFile', path: currentPath }));
      document.getElementById('ctx-new-folder').addEventListener('click', () => vscode.postMessage({ command: 'newFolder', path: currentPath }));
      document.getElementById('ctx-open').addEventListener('click', () => {
          if (contextMenuTargetIndex !== -1) {
              const card = cards[contextMenuTargetIndex];
              handleCardClick(card.dataset.path, card.dataset.isdir === 'true');
          }
      });
      document.getElementById('ctx-copy').addEventListener('click', () => {
          if (contextMenuTargetIndex !== -1) vscode.postMessage({ command: 'copy', path: cards[contextMenuTargetIndex].dataset.path });
      });
      document.getElementById('ctx-paste').addEventListener('click', () => vscode.postMessage({ command: 'paste', targetFolder: currentPath }));
      document.getElementById('ctx-rename').addEventListener('click', () => {
          if (contextMenuTargetIndex !== -1) vscode.postMessage({ command: 'rename', path: cards[contextMenuTargetIndex].dataset.path });
      });
      document.getElementById('ctx-delete').addEventListener('click', () => {
          if (contextMenuTargetIndex !== -1) vscode.postMessage({ command: 'delete', path: cards[contextMenuTargetIndex].dataset.path });
      });
      document.getElementById('root-folder-btn').addEventListener('click', () => vscode.postMessage({ command: 'chooseFolder' }));

      // --- 鍵盤與拖曳事件 ---
      document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.code === 'Backslash') {
           e.preventDefault(); e.stopPropagation();
           vscode.postMessage({ command: 'split', path: currentPath });
           return;
        }
        if (e.key === 'F2' && focusedIndex !== -1) vscode.postMessage({ command: 'rename', path: cards[focusedIndex].dataset.path });
        if ((e.ctrlKey || e.metaKey) && e.key === 'c' && focusedIndex !== -1) vscode.postMessage({ command: 'copy', path: cards[focusedIndex].dataset.path });
        if ((e.ctrlKey || e.metaKey) && e.key === 'v') vscode.postMessage({ command: 'paste', targetFolder: currentPath });
        if (e.key === 'Delete' && focusedIndex !== -1) vscode.postMessage({ command: 'delete', path: cards[focusedIndex].dataset.path });
        
        if (cards.length === 0) return;
        if (focusedIndex === -1 && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            focusedIndex = 0; updateFocus(); return;
        }
        const cols = getColumnsCount(); const total = cards.length;
        switch (e.key) {
          case 'ArrowRight': if (focusedIndex < total - 1) focusedIndex++; break;
          case 'ArrowLeft': if (focusedIndex > 0) focusedIndex--; break;
          case 'ArrowDown': if (focusedIndex + cols < total) focusedIndex += cols; break;
          case 'ArrowUp': if (focusedIndex - cols >= 0) focusedIndex -= cols; break;
          case 'Enter': if (focusedIndex !== -1) handleCardClick(cards[focusedIndex].dataset.path, cards[focusedIndex].dataset.isdir === 'true'); break;
        }
        updateFocus();
      });

      document.body.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; document.body.classList.add('drag-over'); });
      document.body.addEventListener('dragleave', () => document.body.classList.remove('drag-over') );
      document.body.addEventListener('drop', (e) => {
          e.preventDefault();
          document.body.classList.remove('drag-over');
          const sourcePath = e.dataTransfer.getData('text/plain');
          if (sourcePath) vscode.postMessage({ command: 'dropFile', source: sourcePath, targetFolder: currentPath });
      });
    </script>
  </body>
  </html>`;
}