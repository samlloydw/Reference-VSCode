import * as vscode from 'vscode';

/**
 * Gets the Class > Method path, stripping parameters and generics.
 */
async function getCodeContext(editor: vscode.TextEditor): Promise<string> {
    const position = editor.selection.active;
    const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
        'vscode.executeDocumentSymbolProvider',
        editor.document.uri
    );

    if (!symbols) return "";

    const breadcrumbs: string[] = [];
    function findRecursive(symbolList: vscode.DocumentSymbol[]) {
        for (const symbol of symbolList) {
            if (symbol.range.contains(position)) {
                const cleanName = symbol.name.split(/[<()]/)[0].trim();
                breadcrumbs.push(cleanName);
                if (symbol.children?.length) findRecursive(symbol.children);
                break;
            }
        }
    }

    findRecursive(symbols);
    return breadcrumbs.join(' > ');
}

/**
 * Grabs the repo name and short commit hash.
 */
function getGitInfo(uri: vscode.Uri) {
    const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
    if (!gitExtension) return { repo: "no-git", hash: "no-commit" };

    const api = gitExtension.getAPI(1);
    const repo = api.getRepository(uri);
    if (!repo) return { repo: "no-repo", hash: "no-commit" };

    const remote = repo.state.remotes[0]?.fetchUrl || "local";
    const hash = repo.state.HEAD?.commit?.substring(0, 7) || "unsaved";
    
    // Clean repo string
    const cleanRepo = remote.replace('https://', '').replace('.git', '');
    return { repo: cleanRepo, hash };
}

/**
 * Shared logic to build and copy the string
 */
async function runCopyReference(includeCode: boolean) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const { repo, hash } = getGitInfo(editor.document.uri);
    const path = vscode.workspace.asRelativePath(editor.document.uri);
    const contextPath = await getCodeContext(editor);
    
    const start = editor.selection.start.line + 1;
    const end = editor.selection.end.line + 1;
    const lines = editor.selection.isSingleLine ? `L${start}` : `L${start}-L${end}`;
    
    const lang = editor.document.languageId === "plaintext" ? "" : editor.document.languageId;
    const code = editor.document.getText(editor.selection);

    // Build the array (No emojis, clean text)
    const linesArray = [
        `PATH: ${path}`,
        `REPO: ${repo} (ref: ${hash})`,
        contextPath ? `CONTEXT: ${contextPath} [${lines}]` : `LOCATION: ${lines}`
    ];

    if (includeCode) {
        linesArray.push('', `\`\`\`${lang}`, code, `\`\`\``);
    }

    await vscode.env.clipboard.writeText(linesArray.join('\n'));
    vscode.window.showInformationMessage(includeCode ? 'Full reference copied' : 'Reference link copied');
}

export function activate(context: vscode.ExtensionContext) {
    // Command 1: Full
    context.subscriptions.push(
        vscode.commands.registerCommand('reference-vscode.detailed-reference', () => runCopyReference(true))
    );

    // Command 2: Lite (No code block)
    context.subscriptions.push(
        vscode.commands.registerCommand('reference-vscode.simple-reference', () => runCopyReference(false))
    );
}

export function deactivate() {}