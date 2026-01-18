# Changelog

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
