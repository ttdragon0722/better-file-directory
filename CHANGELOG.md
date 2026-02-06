# Change Log

All notable changes to the "Better-File-Directory" extension will be documented in this file.

## [0.0.12] - 2026-02-06
### Added
- **Reveal in File Explorer**: Added a new navigation button to the editor title bar and explorer view.
    - Click inside the webview to reveal the current sub-directory.
    - Click from the explorer view to reveal the workspace root.
    - Added full support for the Command Palette (`Ctrl+Shift+P`).

### Fixed
- **Layout**: Fixed a CSS Grid layout issue where large vertical gaps appeared between rows when the window height was large (adjusted `align-content`).
- **Icons**: Fixed an issue where the "Reveal" command icon was not displaying correctly.
- **Command Registration**: Fixed missing `category` in `package.json` that prevented commands from appearing in the quick pick menu.

## [0.0.11] - 2026-02-06
- Bug fixed.

## [0.0.10] - 2026-02-05
### Changed
- **Settings UI Upgrade**: Refactored configuration settings (favoriteFolders, customFolderIcons, etc.) to use a Key-Value Map structure. This enables the native "Add Item" interface in VS Code Settings, making it much easier to add and manage paths/icons without editing JSON manually.
- **Command Enhancement**: The better-file-directory.open command now supports passing a URI or string argument, allowing for integration with keybindings or other automation tools.

### Add
- **Smart Notifications**: Added an "Open Now" action button to the notification that appears after successfully adding a new favorite folder.
- **Workspace Support**: The View Current Folder command now supports Multi-root Workspaces. If multiple folders are open, a QuickPick menu allows you to choose which one to view.

## [0.0.9] - 2026-02-04
- View Title Icon: Fixed a syntax issue in package.json that prevented the "Open Better File View" icon ($(layout)) from appearing in the Explorer title bar.

## [0.0.8] - 2026-02-03
- readme mistake

## [0.0.7] - 2026-02-03

### Added
- **Multi-language Support (i18n)**: Added `package.nls.json` and `package.nls.zh-tw.json` to support both English and Traditional Chinese interfaces.
- **Improved Documentation**: Fully revamped `README.md` (English) and added `README.zh-TW.md` (Traditional Chinese) for a better user onboarding experience.
- **Legal Compliance**: Added a formal `LICENSE` file (MIT License).

### Fixed
- **SEO & Metadata**: Optimized `package.json` keywords, description, and categories to improve visibility on the VS Code Marketplace.
- **Package Metadata**: Updated explicit license and publisher fields.

## [0.0.6] - 2026-02-03

### Fixed
- **SEO Optimization**: Optimized description and keywords (`explorer`, `file-manager`, `directory-view`) for better indexing.

## [0.0.5] - 2026-02-03

### Added
- **File Management**: Added context menu options to Create New File and Create New Folder.
- **Delete Functionality**: Added support for deleting files/folders via context menu or Delete key.
- **Split View Support**: Added `Ctrl + \` shortcut to open a duplicate file view in a split window.
- **Custom Icon Configuration**: Supported `customFolderIcons`, `customFileIcons`, and `customExtensionIcons` in settings.

### Fixed
- **State Restoration**: Fixed an issue where restored windows would be empty; added state serialization.

## [0.0.4] - 2026-02-01

### Added
- **Drag & Drop Support**: Drag files to other windows or drop within the view to duplicate.
- **Clipboard Integration**: Support for `Ctrl+C` (Copy) and `Ctrl+V` (Paste).
- **Material Design Icons**: Integrated rich visual icons.

### Changed
- **Compatibility**: Lowered minimum VS Code version to `^1.90.0`.

## [0.0.1] - 2025-12-19

- Initial Release: Basic grid-based directory navigation.