# 📂 Better File Directory

[English](./README.md) | [繁體中文](./README.zh-TW.md) 

**Better File Directory** 是一款為 VS Code 打造的現代化視覺檔案管理擴充功能。它將傳統的列表清單替換為直觀的 **網格佈局 (Grid Layout)**，結合大型縮圖與精緻的 **Material Design 圖示**，讓開發者在管理專案資產與視覺化整理檔案時更加輕鬆高效。

![Demo](DEMO.png)

---

## ✨ 核心特色

* **🖼️ 視覺化網格佈局**：以大型卡片形式顯示檔案與資料夾。
* **🖼️ 即時縮圖**：自動為圖片檔案生成預覽縮圖。
* **🖱️ 直覺拖放**：支援在不同分割視窗或資料夾間直接拖拽複製檔案。
* **✂️ 完整剪貼簿支援**：完美支援 `Ctrl+C` (複製) 與 `Ctrl+V` (貼上)。
* **⚡ 快速操作選單**：透過自定義右鍵選單快速新建、重新命名或刪除項目。
* **🔀 雙視窗模式**：在視窗內按下 `Ctrl + \` 即可立即開啟對應的分割面板。
* **🎨 自定義圖示**：支援透過 VS Code 設定自定義特定資料夾或副檔名的圖示。

---

## 📖 使用指南

### 1. 導覽操作
* **進入資料夾**：雙擊資料夾卡片，或選取後按 `Enter`。
* **開啟檔案**：雙擊檔案卡片，直接在 VS Code 編輯器中開啟。
* **導覽路徑 (Breadcrumbs)**：點擊頂部的路徑標籤（如 `src` / `components`）可快速跳回上層目錄。

### 2. 檔案管理 (右鍵選單)
在檔案、資料夾或空白處點擊右鍵：
* **New File...**：在當前目錄建立新檔案。
* **New Folder...**：建立子資料夾。
* **Copy / Paste**：跨目錄複製與貼上。
* **Rename**：重新命名 (快速鍵：`F2`)。
* **Delete**：將項目移至垃圾桶 (快速鍵：`Delete`)。

### 3. 拖放功能
* **跨視窗複製**：將檔案卡片拖曳到另一個「Better File Directory」分割視窗即可完成複製。
* **快速備份**：在同一個視窗內小距離拖放，即可快速建立副本（例如：`image_copy.png`）。

---

## ⌨️ 快捷鍵支援

| 按鍵 | 動作說明 |
| :--- | :--- |
| **Arrow Keys** | 在檔案卡片間移動選取 |
| **Enter** | 開啟檔案 / 進入資料夾 |
| **Ctrl / Cmd + C** | 複製選取項目 |
| **Ctrl / Cmd + V** | 貼上項目至當前資料夾 |
| **F2** | 重新命名選取項目 |
| **Delete** | 刪除項目（移至垃圾桶） |
| **Ctrl / Cmd + \\** | 開啟側邊分割視窗 (Side-by-side) |

---

## 🛠️ 指令表 (Command Palette)

您可以透過 `Ctrl+Shift+P` (或 `Cmd+Shift+P`) 輸入以下指令：

| 指令 | 標題 | 描述 |
| :--- | :--- | :--- |
| `better-file-directory.current` | **View Current Folder** | 以網格視圖開啟目前的工作區根目錄 |
| `better-file-directory.open` | **Open Folder View...** | 開啟系統對話框選擇任意資料夾進行檢視 |

---

## ⚙️ 擴充功能設定

您可以編輯 `settings.json` 來自定義圖示。這對於標記特定的 API 資料夾或特殊副檔名非常有用。

### 可用設定項
* `better-file-directory.customFolderIcons`: 映射資料夾名稱至特定圖示。
* `better-file-directory.customFileIcons`: 映射特定檔名至圖示。
* `better-file-directory.customExtensionIcons`: 映射副檔名至圖示。

### 配置範例
```json
{
  "better-file-directory.customFolderIcons": {
    "my-api": "folder-api",
    "private-docs": "folder-secure"
  },
  "better-file-directory.customExtensionIcons": {
    "xyz": "react",
    "data": "database"
  },
  "better-file-directory.customFileIcons": {
    "special.config": "settings"
  }
}
```

## 📌 系統需求
VS Code 版本: 1.90.0 或更高。

## 📄 授權協議
[MIT License](LICENSE)

