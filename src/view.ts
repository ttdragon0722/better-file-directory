import * as path from 'path';

// 黃色資料夾 Base64 (避免破圖)
const DEFAULT_FOLDER_ICON = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI0ZGQ0EyOCIgZD0iTTEwIDRINGMtMS4xIDAtMS45OS45LTEuOTkgMkwyIDE4YzAgMS4xLjkgMiAyIDJoMTZjMS4xIDAgMi0uOSAyLTJWOGMwLTEuMS0uOS0yLTItMmgtOGwtMi0yeiIvPjwvc3ZnPg==";
const ICON_BASE_URL = 'https://raw.githubusercontent.com/PKief/vscode-material-icon-theme/main/icons/';

/**
 * 根據檔名或資料夾名稱，回傳對應的 Icon URL
 */
export function getMaterialIconUrl(filename: string, isDirectory: boolean): string {
  
  if (isDirectory) {
    const folderMap: {[key: string]: string} = {
      'src': 'folder-src', 'dist': 'folder-dist', 'out': 'folder-dist',
      'node_modules': 'folder-node', '.git': 'folder-git', '.github': 'folder-github',
      'components': 'folder-components', 'utils': 'folder-utils', 'public': 'folder-public',
      'assets': 'folder-assets', 'images': 'folder-images', 'img': 'folder-images',
      'test': 'folder-test', 'tests': 'folder-test', 'styles': 'folder-css',
      '.vscode': 'folder-vscode',
      'include': 'folder-include', 'lib': 'folder-lib', 'packages': 'folder-packages',
      'temp': 'folder-temp', 'tmp': 'folder-temp'
    };
    
    const iconName = folderMap[filename.toLowerCase()];
    return iconName ? `${ICON_BASE_URL}${iconName}.svg` : DEFAULT_FOLDER_ICON;
  }

  // 檔案副檔名處理
  let ext = path.extname(filename).toLowerCase().replace('.', '');
  const fileNameLower = filename.toLowerCase();

  const fileMap: {[key: string]: string} = {
    'package.json': 'nodejs', 'package-lock.json': 'nodejs', 'yarn.lock': 'yarn',
    'tsconfig.json': 'tsconfig', 'jsconfig.json': 'javascript',
    'readme.md': 'readme', 'license': 'license', 'license.txt': 'license',
    'dockerfile': 'docker', '.gitignore': 'git', '.gitattributes': 'git',
    '.env': 'tune', '.env.local': 'tune',
    'favicon.ico': 'favicon'
  };
  
  if (fileMap[fileNameLower]) {
    return `${ICON_BASE_URL}${fileMap[fileNameLower]}.svg`;
  }

  const extMap: {[key: string]: string} = {
    'ts': 'typescript', 'tsx': 'react_ts', 'js': 'javascript', 'jsx': 'react', 'mjs': 'javascript',
    'py': 'python', 'pip': 'python',
    'html': 'html', 'htm': 'html',
    'css': 'css', 'scss': 'sass', 'sass': 'sass', 'less': 'less',
    'json': 'json', 'tsbuildinfo': 'json',
    'md': 'markdown', 'mdx': 'markdown',
    'xml': 'xml', 'yaml': 'yaml', 'yml': 'yaml',
    'java': 'java', 'class': 'java', 'jar': 'java',
    'c': 'c', 'h': 'c', 'cpp': 'cpp', 'hpp': 'cpp',
    'cs': 'csharp', 'go': 'go',
    'php': 'php', 'rb': 'ruby', 'rs': 'rust',
    'sql': 'database', 'prisma': 'database',
    'zip': 'zip', 'tar': 'zip', 'gz': 'zip', '7z': 'zip', 'rar': 'zip',
    'pdf': 'pdf',
    'txt': 'document', 'log': 'document', 'ini': 'settings', 'config': 'settings',
    'vue': 'vue', 'svelte': 'svelte', 'astro': 'astro',
    'sh': 'console', 'bash': 'console', 'zsh': 'console', 'bat': 'console', 'cmd': 'console',
    'svg': 'svg', 'png': 'image', 'jpg': 'image', 'jpeg': 'image', 'gif': 'image', 'webp': 'image', 'ico': 'image'
  };

  const iconName = extMap[ext] || 'document'; 
  return `${ICON_BASE_URL}${iconName}.svg`;
}

/**
 * 生成 Webview 的完整 HTML
 */
export function getHtmlForWebview(files: any[], currentPath: string): string {
  // Breadcrumbs Logic
  const sep = currentPath.includes('\\') ? '\\' : '/'; 
  const segments = currentPath.split(sep).filter(s => s.length > 0);
  let accumulatedPath = currentPath.startsWith(sep) ? sep : ''; 
  const breadcrumbsHtml = segments.map((segment, index) => {
    if (index === 0 && currentPath.includes(':')) { accumulatedPath += segment; } 
    else { accumulatedPath = index === 0 && !currentPath.includes(':') ? accumulatedPath + segment : accumulatedPath + sep + segment; }
    const safePath = accumulatedPath.replace(/\\/g, '\\\\');
    return `<span class="chip" onclick="handleCardClick('${safePath}', true)">${segment}</span>`;
  }).join('<span class="divider">/</span>');

  // Cards Logic
  const cardsHtml = files.map((file: any, index: number) => {
    let iconHtml = '';
    const fallbackIcon = file.isDirectory 
      ? DEFAULT_FOLDER_ICON 
      : `${ICON_BASE_URL}document.svg`;

    if (file.isImage) {
      iconHtml = `<img src="${file.webviewUri}" class="thumbnail" loading="lazy" draggable="false" onerror="this.onerror=null;this.src='${fallbackIcon}';" />`;
    } else {
      iconHtml = `<img src="${file.iconUrl}" class="icon-svg" loading="lazy" draggable="false" onerror="this.onerror=null;this.src='${fallbackIcon}';" />`;
    }

    const safePath = file.fsPath.replace(/\\/g, '\\\\');
    
    // *** 修改：移除了 onclick，改由 JS 監聽 click/dblclick ***
    return `
      <div class="card" 
           draggable="true"
           data-index="${index}" 
           data-path="${safePath}" 
           data-isdir="${file.isDirectory}">
        <div class="card-preview">${iconHtml}</div>
        <div class="card-name" title="${file.name}">${file.name}</div>
      </div>
    `;
  }).join('');

  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" 
          content="default-src 'none'; 
                   style-src 'unsafe-inline'; 
                   script-src 'unsafe-inline'; 
                   img-src 'self' data: https: vscode-resource: vscode-webview-resource:;">

    <style>
      html, body { height: 100%; margin: 0; padding: 0; }
      body { font-family: var(--vscode-font-family); background-color: var(--vscode-editor-background); color: var(--vscode-editor-foreground); padding: 20px; user-select: none; overflow-y: auto; height: 100vh; box-sizing: border-box; }
      .breadcrumbs { display: flex; flex-wrap: wrap; align-items: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid var(--vscode-panel-border); font-size: 14px; }
      .chip { background-color: var(--vscode-badge-background); color: var(--vscode-badge-foreground); padding: 4px 12px; border-radius: 16px; cursor: pointer; transition: opacity 0.2s; margin: 2px; }
      .chip:hover { opacity: 0.8; }
      .divider { margin: 0 5px; color: var(--vscode-descriptionForeground); }
      
      .grid-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 15px; padding-bottom: 20px; min-height: 50vh; }
      
      .card { background-color: var(--vscode-editor-inactiveSelectionBackground); border-radius: 8px; padding: 10px; height: 140px; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; cursor: pointer; border: 2px solid transparent; overflow: hidden; }
      .card:hover { background-color: var(--vscode-list-hoverBackground); transform: translateY(-2px); transition: transform 0.1s; }
      /* 確保 focused 樣式明顯 */
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
    <div class="breadcrumbs"><span style="margin-right: 10px;">📂</span>${breadcrumbsHtml}</div>
    <div class="grid-container" id="grid">${cardsHtml}</div>
    <script>
      const vscode = acquireVsCodeApi();
      const currentPath = '${currentPath.replace(/\\/g, '\\\\')}';
      vscode.setState({ path: currentPath });
      
      let focusedIndex = -1;
      const cards = document.querySelectorAll('.card');
      const grid = document.getElementById('grid');

      function handleCardClick(path, isDirectory) {
        vscode.postMessage({ command: 'openPath', path: path, isDirectory: isDirectory });
      }

      function updateFocus() {
        cards.forEach((card, index) => {
          if (index === focusedIndex) {
            card.classList.add('focused');
            // 如果是鍵盤操作，才滾動。點擊操作不需要 (避免跳動)
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

      // ---------------------------------------------------
      // 1. 點擊與雙擊事件 (單擊選擇，雙擊進入)
      // ---------------------------------------------------
      cards.forEach((card, index) => {
          // 單擊：更新選取狀態
          card.addEventListener('click', () => {
              focusedIndex = index;
              updateFocus();
          });

          // 雙擊：進入資料夾或開啟檔案
          card.addEventListener('dblclick', () => {
              handleCardClick(card.dataset.path, card.dataset.isdir === 'true');
          });

          // 拖曳事件 (保持不變)
          card.addEventListener('dragstart', (e) => {
              e.dataTransfer.setData('text/plain', card.dataset.path);
              e.dataTransfer.effectAllowed = 'copy';
              card.classList.add('dragging');
              // 拖曳開始時自動選中該卡片
              focusedIndex = index;
              updateFocus();
          });

          card.addEventListener('dragend', (e) => {
              card.classList.remove('dragging');
          });
      });

      // ---------------------------------------------------
      // 2. 鍵盤事件：導航 + 複製貼上 + F2重新命名
      // ---------------------------------------------------
      document.addEventListener('keydown', (e) => {
        
        // F2 (重新命名)
        if (e.key === 'F2') {
           if (focusedIndex !== -1) {
             const card = cards[focusedIndex];
             vscode.postMessage({ command: 'rename', path: card.dataset.path });
           }
        }

        // Ctrl+C (複製)
        if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
           if (focusedIndex !== -1) {
             const card = cards[focusedIndex];
             vscode.postMessage({ command: 'copy', path: card.dataset.path });
           }
        }
        
        // Ctrl+V (貼上)
        if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
           vscode.postMessage({ command: 'paste', targetFolder: currentPath });
        }

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
          case 'Enter': if (focusedIndex !== -1) { const card = cards[focusedIndex]; handleCardClick(card.dataset.path, card.dataset.isdir === 'true'); } break;
        }
        updateFocus();
      });
      

      // 拖曳放置 (保持不變)
      document.body.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
          document.body.classList.add('drag-over');
      });

      document.body.addEventListener('dragleave', (e) => {
          document.body.classList.remove('drag-over');
      });

      document.body.addEventListener('drop', (e) => {
          e.preventDefault();
          document.body.classList.remove('drag-over');
          
          const sourcePath = e.dataTransfer.getData('text/plain');
          if (sourcePath) {
             vscode.postMessage({ 
                 command: 'dropFile', 
                 source: sourcePath, 
                 targetFolder: currentPath 
             });
          }
      });
    </script>
  </body>
  </html>`;
}