# Wrap Console Log

Wrap the word near your cursor as an argument for logging functions. **Now with automatic language detection** - uses `print()` for Python, `fmt.Println()` for Go, and more.

> Fork of [midnightsyntax/vscode-wrap-console-log](https://github.com/midnightsyntax/vscode-wrap-console-log), published to [Open VSX](https://open-vsx.org/) for Cursor/VSCodium compatibility.

## Key Features

- **Language-aware logging** - Automatically uses the right function for your language
- Optimized for keyboard use
- No selection needed
- Wrap and replace for fast logging
- Preserves indentation
- Supports custom prefix
- Fully configurable

## Supported Languages

| Language | Default Function | Prefix Format |
|----------|-----------------|---------------|
| JavaScript/TypeScript | `console.log(var)` | `console.log('var:', var)` |
| Python | `print(var)` | `print(f'var: {var}')` |
| Go | `fmt.Println(var)` | `fmt.Printf("var: %v\n", var)` |
| Rust | `println!("{:?}", var)` | `println!("var: {:?}", var)` |
| Ruby | `puts(var)` | `puts("var: #{var}")` |
| Java | `System.out.println(var)` | `System.out.println("var: " + var)` |
| C# | `Console.WriteLine(var)` | `Console.WriteLine($"var: {var}")` |
| PHP | `var_dump(var)` | `var_dump("var:", var)` |
| Swift | `print(var)` | `print("var:", var)` |
| Kotlin | `println(var)` | `println("var: $var")` |
| Elixir | `IO.inspect(var)` | `IO.inspect(var, label: "var")` |
| And more... | | |

## Usage

### Type the variable to log

![demo](images/screenshot_inline_replace.gif)

### Log the variable on cursor

![demo](images/screenshot_log_cursor.gif)

### Type and log it as a string

![demo](images/screenshot_inline_string.gif)

### Keep your indents

![demo](images/screenshot_indent.gif)

### Use custom prefix

![demo](images/screenshot_custom_prefix.gif)

## Keyboard Shortcuts

All shortcuts use **Cmd+Option+Ctrl** as the base modifier (macOS).

### Core Commands

| Action | Shortcut | Description |
|--------|----------|-------------|
| Wrap | `Cmd+Option+Ctrl+L` | Replace word at cursor with log |
| Wrap down | `Cmd+Option+Ctrl+Down` | Insert log on line below |
| Wrap up | `Cmd+Option+Ctrl+Up` | Insert log on line above |

### With Prefix

| Action | Shortcut | Description |
|--------|----------|-------------|
| Prefix | `Cmd+Option+Ctrl+P` | Log with variable name as label |
| Prefix down | `Cmd+Option+Ctrl+Shift+Down` | Insert prefixed log below |
| Prefix up | `Cmd+Option+Ctrl+Shift+Up` | Insert prefixed log above |

### With Input Box

| Action | Shortcut | Description |
|--------|----------|-------------|
| Input | `Cmd+Option+Ctrl+I` | Log with custom prefix via input box |
| Input down | `Cmd+Option+Ctrl+Shift+D` | Insert with input box below |
| Input up | `Cmd+Option+Ctrl+Shift+U` | Insert with input box above |

### Log as String

| Action | Shortcut | Description |
|--------|----------|-------------|
| String | `Cmd+Option+Ctrl+S` | Replace text with string log |
| String down | `Cmd+Option+Ctrl+Shift+S` | Insert string log below |
| String up | `Cmd+Option+Ctrl+Shift+A` | Insert string log above |

> **Note:** If the string contains spaces, select the whole string first.

## Configuration

### Language Detection

- `wrap-console-log.useLanguageDefaults` (default: `true`) - Automatically use language-appropriate log functions

### Custom Functions

Override the defaults for any language:

- `wrap-console-log.format.wrap.logFunctionName` - Custom log function (overrides language default)
- `wrap-console-log.format.wrap.logString` - Custom log template using `$func` and `$var`
- `wrap-console-log.format.wrap.prefixFunctionName` - Custom prefix function
- `wrap-console-log.format.wrap.prefixString` - Custom prefix template

### Behavior

- `wrap-console-log.autoFormat` - Run format after logging
- `wrap-console-log.alwaysUsePrefix` - Always include variable name as prefix
- `wrap-console-log.alwaysInputBoxOnPrefix` - Always show input box for custom prefix
- `wrap-console-log.configuration.emptyLineAction` - How to handle empty target lines
- `wrap-console-log.configuration.moveToLine` - Where to place cursor after logging
- `wrap-console-log.configuration.moveToPosition` - Cursor position within the line

## Installation

Search "Wrap Console Log" in the Extensions panel (Cursor, VSCodium, or VS Code with Open VSX).

## License

MIT - See [LICENSE](LICENSE)

Original work by [midnightsyntax](https://github.com/midnightsyntax).
