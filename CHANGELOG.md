Change Log

All notable changes to the "Better-File-Directory" extension will be documented in this file.

[0.0.5] - 2026-02-03

Added

File Management: Added context menu options to Create New File and Create New Folder.

Delete Functionality: Added support for deleting files/folders via the context menu or the Delete key (moves to trash with confirmation).

Split View Support: Pressing Ctrl + \ (or Cmd + \ on Mac) now correctly opens a duplicate file view in a split window.

Custom Icon Configuration: Users can now customize icons via settings.json using customFolderIcons, customFileIcons, and customExtensionIcons.

Fixed

State Restoration: Fixed an issue where split views or restored windows would be empty. The extension now correctly serializes and restores the directory state.

[0.0.4] - 2026-02-01

Added

Drag & Drop Support: You can now drag files from the grid view to other windows or drop them within the view to duplicate them.

Clipboard Integration: Support for Ctrl+C (Copy) and Ctrl+V (Paste) to manage files quickly.

Material Design Icons: Integrated rich file icons for better visual recognition.

Smart Fallback: Added a robust fallback mechanism for folder icons (yellow folder) to prevent broken images.

Changed

Compatibility: Lowered the minimum required VS Code version to ^1.90.0 to support more users.

Performance: Optimized the Webview loading speed and icon rendering logic.

[0.0.1] - Initial Release

Basic functionality to view directory contents as large thumbnails.

Support for navigating through folders.