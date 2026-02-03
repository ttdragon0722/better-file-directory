# 📂 Better File Directory

[English](./README.md) | [繁體中文](./README.zh-TW.md) 

**Better File Directory** is a modern visual file management extension for VS Code. It replaces the standard list view with an intuitive **Grid Layout**, featuring large thumbnails and rich **Material Design icons**, making it easier for developers to manage project assets and organize files visually.

---

## ✨ Key Features

* **🖼️ Visual Grid Layout**: View files and folders as elegant cards instead of dense lists.
* **🖼️ Instant Thumbnails**: Automatically generates previews for image files.
* **🖱️ Intuitive Drag & Drop**: Copy files easily by dragging them between different split views or folders.
* **✂️ Full Clipboard Support**: Native support for `Ctrl+C` (Copy) and `Ctrl+V` (Paste).
* **⚡ Quick Action Menu**: Create, rename, or delete items via a customized context menu.
* **🔀 Split View Mode**: Press `Ctrl + \` to instantly open a side-by-side pane for efficient file transfer.
* **🎨 Custom Icons**: Customize folder and extension icons via VS Code settings.

---

## 📖 Usage Guide

### 1. Navigation
* **Enter Folder**: Double-click a folder card or select it and press `Enter`.
* **Open File**: Double-click a file card to open it in the VS Code editor.
* **Breadcrumbs**: Use the navigation chips at the top (e.g., `src` / `components`) to quickly jump back to parent directories.

### 2. Management (Context Menu)
Right-click on any item or the background:
* **New File...**: Create a new file in the current directory.
* **New Folder...**: Create a new subfolder.
* **Copy / Paste**: Standard clipboard operations.
* **Rename**: Rename the selected item (Shortcut: `F2`).
* **Delete**: Move the item to Trash (Shortcut: `Delete`).

### 3. Drag and Drop
* **Cross-view Copy**: Drag a card and drop it into another "Better File Directory" window to copy.
* **Quick Duplicate**: Drag and drop slightly within the same view to create a copy (e.g., `image_copy.png`).

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
| :--- | :--- |
| **Arrow Keys** | Navigate between cards |
| **Enter** | Open file / Enter folder |
| **Ctrl / Cmd + C** | Copy selected item |
| **Ctrl / Cmd + V** | Paste into current folder |
| **F2** | Rename selected item |
| **Delete** | Move to Trash |
| **Ctrl / Cmd + \\** | Open in Split View |

---

## 🛠️ Commands

Access these via the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`):

| Command | Title | Description |
| :--- | :--- | :--- |
| `better-file-directory.current` | **View Current Folder** | Open the grid view for the active workspace root |
| `better-file-directory.open` | **Open Folder View...** | Choose any folder to open in the grid view |

---

## ⚙️ Extension Settings

Customize your icons in `settings.json`:

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

## 📌 Requirements
VS Code Version: 1.90.0 or higher.

## 📄 License
[MIT License](LICENSE)