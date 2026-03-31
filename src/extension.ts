import * as vscode from 'vscode';

async function getContext(editor: vscode.TextEditor): Promise<string> {
    const position = editor.selection.active;
    
    // Ask VS Code for the symbol tree of the current file
    const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
        'vscode.executeDocumentSymbolProvider',
        editor.document.uri
    );

    if (!symbols) return "";

    let context: string[] = [];

    // Helper to walk down the tree
    function findRecursive(symbolList: vscode.DocumentSymbol[]) {
        for (const symbol of symbolList) {
            // Check if our cursor is inside this symbol's range
            if (symbol.range.contains(position)) {
				const cleanName = symbol.name.replace(/\(.*\)/g, '').trim();
                context.push(cleanName);
                if (symbol.children && symbol.children.length > 0) {
                    findRecursive(symbol.children);
                }
                break; // We found the path, stop sibling search
            }
        }
    }

    findRecursive(symbols);
    return context.join(' > '); // e.g., "UserModule > AuthService > login"
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "reference-vscode" is now active!');

	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('reference-vscode.simple-reference', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) return;

		const selection = editor.selection;
		const text = editor.document.getText(selection);
		const path = vscode.workspace.asRelativePath(editor.document.uri);
		const lang = editor.document.languageId === "plaintext" ? "" : editor.document.languageId;
		const fromLine = selection.start.line + 1;
		var lineRange;
		if (!selection.isSingleLine) {
			const toLine = selection.end.line + 1;
			lineRange = `L${fromLine}-${toLine}`;
		} else {
			lineRange = `L${fromLine}`;
		}

		const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
		const gitApi = gitExtension.getAPI(1);
		const uri = editor.document.uri;
		const repository = gitApi.getRepository(uri);
		let repoName = "no-repo";
		let commitHash = "no-commit";
		if (repository) {
			// Get the remote URL (e.g., github.com/user/repo)
			const remote = repository.state.remotes[0];
			repoName = remote ? remote.fetchUrl : "local-only";
			commitHash = repository.state.HEAD?.commit?.substring(0, 7) || "unsaved";
		}
		const codeContext = await getContext(editor);

		const finalString = `${repoName} (${commitHash}) > ${path}\n${codeContext} @ ${lineRange}\n\n\`\`\`${lang}\n${text}\n\`\`\``;
		await vscode.env.clipboard.writeText(finalString);
		vscode.window.showInformationMessage('Successfully copied simple reference');
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}