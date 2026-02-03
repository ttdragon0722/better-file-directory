# Change Log

All notable changes to the "Better-File-Directory" extension will be documented in this file.

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