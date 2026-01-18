'use strict';

import * as vscode from 'vscode';

let currentEditor: vscode.TextEditor | undefined;

// Language-specific defaults for log functions
const LANGUAGE_DEFAULTS: Record<string, { func: string; template: string; prefixFunc: string; prefixTemplate: string }> = {
    javascript: {
        func: 'console.log',
        template: '$func($var)',
        prefixFunc: 'console.log',
        prefixTemplate: "$func('$var:', $var)"
    },
    javascriptreact: {
        func: 'console.log',
        template: '$func($var)',
        prefixFunc: 'console.log',
        prefixTemplate: "$func('$var:', $var)"
    },
    typescript: {
        func: 'console.log',
        template: '$func($var)',
        prefixFunc: 'console.log',
        prefixTemplate: "$func('$var:', $var)"
    },
    typescriptreact: {
        func: 'console.log',
        template: '$func($var)',
        prefixFunc: 'console.log',
        prefixTemplate: "$func('$var:', $var)"
    },
    python: {
        func: 'print',
        template: '$func($var)',
        prefixFunc: 'print',
        prefixTemplate: "$func(f'$var: {$var}')"
    },
    go: {
        func: 'fmt.Println',
        template: '$func($var)',
        prefixFunc: 'fmt.Printf',
        prefixTemplate: '$func("$var: %v\\n", $var)'
    },
    rust: {
        func: 'println!',
        template: '$func("{:?}", $var)',
        prefixFunc: 'println!',
        prefixTemplate: '$func("$var: {:?}", $var)'
    },
    ruby: {
        func: 'puts',
        template: '$func($var)',
        prefixFunc: 'puts',
        prefixTemplate: '$func("$var: #{$var}")'
    },
    php: {
        func: 'var_dump',
        template: '$func($var)',
        prefixFunc: 'var_dump',
        prefixTemplate: '$func("$var:", $var)'
    },
    java: {
        func: 'System.out.println',
        template: '$func($var)',
        prefixFunc: 'System.out.println',
        prefixTemplate: '$func("$var: " + $var)'
    },
    csharp: {
        func: 'Console.WriteLine',
        template: '$func($var)',
        prefixFunc: 'Console.WriteLine',
        prefixTemplate: '$func($"$var: {$var}")'
    },
    swift: {
        func: 'print',
        template: '$func($var)',
        prefixFunc: 'print',
        prefixTemplate: '$func("$var:", $var)'
    },
    kotlin: {
        func: 'println',
        template: '$func($var)',
        prefixFunc: 'println',
        prefixTemplate: '$func("$var: $$var")'
    },
    lua: {
        func: 'print',
        template: '$func($var)',
        prefixFunc: 'print',
        prefixTemplate: '$func("$var:", $var)'
    },
    perl: {
        func: 'print',
        template: '$func($var)',
        prefixFunc: 'print',
        prefixTemplate: '$func("$var: $var\\n")'
    },
    r: {
        func: 'print',
        template: '$func($var)',
        prefixFunc: 'print',
        prefixTemplate: '$func(paste("$var:", $var))'
    },
    elixir: {
        func: 'IO.inspect',
        template: '$func($var)',
        prefixFunc: 'IO.inspect',
        prefixTemplate: '$func($var, label: "$var")'
    },
    dart: {
        func: 'print',
        template: '$func($var)',
        prefixFunc: 'print',
        prefixTemplate: "$func('$var: $$var')"
    },
    scala: {
        func: 'println',
        template: '$func($var)',
        prefixFunc: 'println',
        prefixTemplate: '$func(s"$var: $$var")'
    }
};

// Default fallback (JavaScript-style)
const DEFAULT_LOG = {
    func: 'console.log',
    template: '$func($var)',
    prefixFunc: 'console.log',
    prefixTemplate: "$func('$var:', $var)"
};

export function activate(context: vscode.ExtensionContext) {
    currentEditor = vscode.window.activeTextEditor;

    // Validate enum settings on activation
    const config = vscode.workspace.getConfiguration('wrap-console-log');
    const extension = vscode.extensions.getExtension('jayblack388.vscode-wrap-console-log');
    
    if (extension) {
        const props = extension.packageJSON?.contributes?.configuration?.properties;
        if (props) {
            Object.keys(props).forEach((prop) => {
                const pName = prop.replace('wrap-console-log.', '');
                const pObj = props[prop];
                const settingValue = config.get(pName);
                
                if (pObj?.enum) {
                    const valueValid = pObj.enum.some((val: string) => val === settingValue);
                    if (!valueValid && settingValue !== undefined) {
                        config.update(pName, undefined, vscode.ConfigurationTarget.Global);
                        console.log(`Invalid setting value! '${pName}' has been set to default value '${pObj.default}'`);
                    }
                }
            });
        }
    }

    vscode.window.onDidChangeActiveTextEditor(editor => currentEditor = editor);

    context.subscriptions.push(
        vscode.commands.registerTextEditorCommand('console.log.wrap', () => handle(Wrap.Inline)),
        vscode.commands.registerTextEditorCommand('console.log.wrap.string', () => handle(Wrap.Inline, false, false, FormatAs.String)),
        vscode.commands.registerTextEditorCommand('console.log.wrap.string.up', () => handle(Wrap.Up, false, false, FormatAs.String)),
        vscode.commands.registerTextEditorCommand('console.log.wrap.string.down', () => handle(Wrap.Down, false, false, FormatAs.String)),
        vscode.commands.registerTextEditorCommand('console.log.wrap.prefix', () => handle(Wrap.Inline, true)),
        vscode.commands.registerTextEditorCommand('console.log.wrap.input', () => handle(Wrap.Inline, true, true)),
        vscode.commands.registerTextEditorCommand('console.log.wrap.up', () => handle(Wrap.Up)),
        vscode.commands.registerTextEditorCommand('console.log.wrap.up.prefix', () => handle(Wrap.Up, true)),
        vscode.commands.registerTextEditorCommand('console.log.wrap.up.input', () => handle(Wrap.Up, true, true)),
        vscode.commands.registerTextEditorCommand('console.log.wrap.down', () => handle(Wrap.Down)),
        vscode.commands.registerTextEditorCommand('console.log.wrap.down.prefix', () => handle(Wrap.Down, true)),
        vscode.commands.registerTextEditorCommand('console.log.wrap.down.input', () => handle(Wrap.Down, true, true))
    );
}

function getLanguageDefaults(): { func: string; template: string; prefixFunc: string; prefixTemplate: string } {
    if (!currentEditor) {
        return DEFAULT_LOG;
    }

    const useLanguageDefaults = getSetting('useLanguageDefaults') as boolean;
    if (!useLanguageDefaults) {
        return DEFAULT_LOG;
    }

    const languageId = currentEditor.document.languageId;
    return LANGUAGE_DEFAULTS[languageId] || DEFAULT_LOG;
}

function getLogFunction(isPrefix: boolean): string {
    const defaults = getLanguageDefaults();
    const settingKey = isPrefix ? 'format.wrap.prefixFunctionName' : 'format.wrap.logFunctionName';
    const userSetting = getSetting(settingKey) as string;
    
    // If user has set a custom value, use it
    if (userSetting && userSetting.trim() !== '') {
        return userSetting;
    }
    
    return isPrefix ? defaults.prefixFunc : defaults.func;
}

function getLogTemplate(isPrefix: boolean): string {
    const defaults = getLanguageDefaults();
    const settingKey = isPrefix ? 'format.wrap.prefixString' : 'format.wrap.logString';
    const userSetting = getSetting(settingKey) as string;
    
    // If user has set a custom value, use it
    if (userSetting && userSetting.trim() !== '') {
        return userSetting;
    }
    
    return isPrefix ? defaults.prefixTemplate : defaults.template;
}

function handle(target: Wrap, prefix?: boolean, input?: boolean, formatAs?: FormatAs) {
    if (!currentEditor) {
        return;
    }

    new Promise<WrapData>((resolve, reject) => {
        if (!currentEditor) {
            reject('NO_EDITOR');
            return;
        }

        const sel = currentEditor.selection;
        const len = sel.end.character - sel.start.character;

        const ran = len === 0 
            ? currentEditor.document.getWordRangeAtPosition(sel.anchor)
            : new vscode.Range(sel.start, sel.end);

        if (ran === undefined) {
            reject('NO_WORD');
            return;
        }

        const doc = currentEditor.document;
        const lineNumber = ran.start.line;
        const idx = doc.lineAt(lineNumber).firstNonWhitespaceCharacterIndex;
        const wrapData: WrapData = {
            txt: '',
            item: doc.getText(ran),
            doc: doc,
            ran: ran,
            idx: idx,
            ind: doc.lineAt(lineNumber).text.substring(0, idx),
            line: lineNumber,
            sel: sel,
            lastLine: doc.lineCount - 1 === lineNumber
        };

        prefix = prefix || (getSetting('alwaysUsePrefix') as boolean) ? true : false;

        if (prefix) {
            if ((getSetting('alwaysInputBoxOnPrefix') as boolean) === true || input) {
                vscode.window.showInputBox({
                    placeHolder: 'Prefix string',
                    value: '',
                    prompt: 'Use text from input box as prefix'
                }).then((val) => {
                    if (val !== undefined) {
                        const func = getLogFunction(true);
                        wrapData.txt = func.concat("('", val.trim(), "',", wrapData.item, ")");
                        resolve(wrapData);
                    } else {
                        reject('INPUT_CANCEL');
                    }
                });
            } else {
                const func = getLogFunction(true);
                const template = getLogTemplate(true);
                wrapData.txt = template
                    .replace('$func', func)
                    .replace(/[$]var/g, wrapData.item);
                resolve(wrapData);
            }
        } else {
            if (formatAs !== undefined) {
                switch (formatAs) {
                    case FormatAs.String:
                        const func = getLogFunction(false);
                        wrapData.txt = func.concat("('", wrapData.item, "')");
                        break;
                }
            } else {
                const func = getLogFunction(false);
                const template = getLogTemplate(false);
                wrapData.txt = template
                    .replace('$func', func)
                    .replace(/[$]var/g, wrapData.item);
            }
            resolve(wrapData);
        }
    }).then((wrap: WrapData) => {
        if (!currentEditor) {
            return;
        }

        const onEmptyAction = getSetting('configuration.emptyLineAction') as string;
        const setCursorLine = getSetting('configuration.moveToLine') as string;

        function SetCursor(line: number, _character?: number) {
            if (!currentEditor) {
                return;
            }

            let tpos: vscode.Position;
            switch (getSetting('configuration.moveToPosition')) {
                case 'Current position':
                    tpos = new vscode.Position(line, currentEditor.selection.anchor.character);
                    break;
                case 'End of line':
                    tpos = new vscode.Position(line, currentEditor.document.lineAt(line).range.end.character);
                    break;
                case 'Beginning of line':
                    tpos = new vscode.Position(line, currentEditor.document.lineAt(line).range.start.character);
                    break;
                case 'Beginning of wrap':
                    tpos = new vscode.Position(line, _character || 0);
                    break;
                case 'First character':
                    tpos = new vscode.Position(line, currentEditor.document.lineAt(line).firstNonWhitespaceCharacterIndex);
                    break;
                default:
                    tpos = new vscode.Position(line, currentEditor.selection.anchor.character);
                    break;
            }
            currentEditor.selection = new vscode.Selection(tpos, tpos);
        }

        function getTargetLine(go: Wrap): number {
            let stop = false;
            let li = wrap.line;
            while (!stop) {
                if (go === Wrap.Down) {
                    li++;
                } else {
                    li--;
                }
                if (li < wrap.doc.lineCount) {
                    if (!wrap.doc.lineAt(li).isEmptyOrWhitespace) {
                        stop = true;
                    }
                } else {
                    if (li === wrap.doc.lineCount) {
                        li--;
                    }
                    stop = true;
                }
            }
            return li;
        }

        switch (target) {
            case Wrap.Inline: {
                currentEditor.edit((e) => {
                    e.replace(wrap.ran, wrap.txt);
                }).then(() => {
                    if (!currentEditor) {
                        return;
                    }
                    currentEditor.selection = new vscode.Selection(
                        new vscode.Position(wrap.ran.start.line, wrap.txt.length + wrap.ran.start.character),
                        new vscode.Position(wrap.ran.start.line, wrap.txt.length + wrap.ran.start.character)
                    );
                });
                break;
            }

            case Wrap.Up: {
                const tLine = wrap.doc.lineAt(wrap.line === 0 ? 0 : wrap.line - 1);
                const tLineEmpty = tLine.text.trim() === '' ? true : false;
                let lineCorr = 0;

                currentEditor.edit((e) => {
                    if (tLineEmpty && onEmptyAction === 'Replace empty') {
                        lineCorr = -1;
                        e.delete(tLine.rangeIncludingLineBreak);
                        e.insert(new vscode.Position(wrap.line, 0), wrap.ind.concat(wrap.txt, '\n'));
                    } else {
                        setCursorLine === 'Current line' ? lineCorr = 1 : lineCorr = 0;
                        if (setCursorLine === 'Target line') {
                            e.insert(new vscode.Position(wrap.line - 1, wrap.idx), wrap.ind.concat(wrap.txt));
                        } else {
                            e.insert(new vscode.Position(wrap.line, wrap.idx), wrap.txt.concat('\n', wrap.ind));
                        }
                    }
                }).then(() => {
                    SetCursor(wrap.line + lineCorr, wrap.ind.length);
                });
                break;
            }

            case Wrap.Down: {
                let nxtLine: vscode.TextLine | undefined;
                let nxtLineInd: string;

                if (!wrap.lastLine) {
                    nxtLine = wrap.doc.lineAt(wrap.line + 1);
                    nxtLineInd = nxtLine.text.substring(0, nxtLine.firstNonWhitespaceCharacterIndex);
                } else {
                    nxtLineInd = '';
                }

                wrap.ind = vscode.workspace.getConfiguration('wrap-console-log').get('autoFormat') === true ? '' : wrap.ind;
                
                currentEditor.edit((e) => {
                    let nxtNonEmpty: vscode.TextLine | undefined;
                    if (nxtLine) {
                        nxtNonEmpty = nxtLine.isEmptyOrWhitespace ? wrap.doc.lineAt(getTargetLine(Wrap.Down)) : undefined;
                    }
                    if (wrap.lastLine === false && nxtLine && nxtLine.isEmptyOrWhitespace) {
                        function defaultAction() {
                            e.insert(
                                new vscode.Position(wrap.line, wrap.doc.lineAt(wrap.line).range.end.character),
                                '\n'.concat((nxtLineInd > wrap.ind ? nxtLineInd : wrap.ind), wrap.txt)
                            );
                        }
                        if (onEmptyAction === 'Insert and push') {
                            defaultAction();
                        } else if (onEmptyAction === 'Replace empty') {
                            if (nxtLine && nxtNonEmpty && nxtNonEmpty.firstNonWhitespaceCharacterIndex > 0) {
                                e.replace(
                                    new vscode.Position(nxtLine.lineNumber, 0),
                                    ' '.repeat(nxtNonEmpty.firstNonWhitespaceCharacterIndex).concat(wrap.txt)
                                );
                            } else {
                                e.replace(new vscode.Position(nxtLine!.lineNumber, 0), wrap.ind.concat(wrap.txt));
                            }
                        } else {
                            console.log(`Invalid config setting! Using 'emptyLineAction' default value`);
                            defaultAction();
                        }
                    } else {
                        e.insert(
                            new vscode.Position(wrap.line, wrap.doc.lineAt(wrap.line).range.end.character),
                            '\n'.concat((nxtLineInd.length > wrap.ind.length ? nxtLineInd : wrap.ind), wrap.txt)
                        );
                    }
                }).then(() => {
                    if (!currentEditor) {
                        return;
                    }
                    if (nxtLine === undefined) {
                        nxtLine = wrap.doc.lineAt(wrap.line + 1);
                    }
                    if ((getSetting('autoFormat') as boolean) === true && !wrap.lastLine) {
                        const nextLineEnd = wrap.doc.lineAt(wrap.line + 2).range.end;
                        currentEditor.selection = new vscode.Selection(wrap.sel.start, nextLineEnd);
                        vscode.commands.executeCommand('editor.action.formatSelection').then(() => {
                            if (!currentEditor) {
                                return;
                            }
                            currentEditor.selection = wrap.sel;
                        }, (err) => {
                            vscode.window.showErrorMessage("'formatSelection' could not execute properly");
                            console.error(err);
                        });
                    } else {
                        currentEditor.selection = wrap.sel;
                    }
                    SetCursor(setCursorLine === 'Current line' ? wrap.line : wrap.line + 1);
                });
                break;
            }

            default:
                break;
        }

        if ((getSetting('formatDocument') as boolean) === true) {
            vscode.commands.executeCommand('editor.action.formatDocument');
        }

    }).catch(message => {
        console.log('vscode-wrap-console-log CANCEL: ' + message);
    });
}

function getSetting(setting: string): unknown {
    const spl = setting.split('.');

    if (spl.length === 1) {
        return vscode.workspace.getConfiguration('wrap-console-log').get(setting);
    }
    
    const config = vscode.workspace.getConfiguration('wrap-console-log').get(spl[0]) as Record<string, unknown> | undefined;
    if (!config) {
        return undefined;
    }
    
    return spl.slice(1).reduce<unknown>((acc, key) => {
        if (acc && typeof acc === 'object' && key in acc) {
            return (acc as Record<string, unknown>)[key];
        }
        return undefined;
    }, config);
}

interface WrapData {
    txt: string;
    item: string;
    sel: vscode.Selection;
    doc: vscode.TextDocument;
    ran: vscode.Range;
    ind: string;
    idx: number;
    line: number;
    lastLine: boolean;
}

enum FormatAs {
    String
}

enum Wrap {
    Inline,
    Down,
    Up
}

export function deactivate() {
    return undefined;
}
