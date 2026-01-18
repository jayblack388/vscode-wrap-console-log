# Changelog

## [2.0.0](https://github.com/jayblack388/vscode-wrap-console-log/compare/v1.7.3...v2.0.0) (2026-01-18)


### ⚠ BREAKING CHANGES

* Settings default to empty strings and use language defaults. Existing custom logFunctionName/logString settings continue to work as overrides.

### Features

* fork with language-aware logging and Open VSX publishing ([5ba6988](https://github.com/jayblack388/vscode-wrap-console-log/commit/5ba698860e3138f5fd0a559674f66c9a679bc6f9))

## [2.0.0](https://github.com/jayblack388/vscode-wrap-console-log/releases/tag/v2.0.0) (2024-01-17)

### Features

* **language-detection**: Automatically detect file language and use appropriate log function
* **python**: Use `print()` for Python files
* **go**: Use `fmt.Println()` for Go files  
* **rust**: Use `println!()` for Rust files
* **multi-language**: Support for 15+ languages with sensible defaults

### Changes

* Fork published to Open VSX for Cursor/VSCodium compatibility
* Modernized TypeScript and dependencies
* Settings now default to empty strings (uses language defaults unless overridden)
* Added `useLanguageDefaults` setting to toggle language detection

### Migration from v1.x

If you had custom `logFunctionName` or `logString` settings, they will continue to work and override language defaults. To use language detection, clear these settings or set them to empty strings.
