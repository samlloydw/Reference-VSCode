# reference-vscode README

Reference code snippets in VSCode.

## Features

Reference sections of code easily using via copy-and-paste.

### Simple Reference

Copies high-level metadata to your clipboard:
- **Repo:** Extracted from local Git remotes.
- **Commit Hash:** The short SHA for the current HEAD.
- **Path:** Workspace-relative file path.
- **Context:** Intelligent breadcrumbs (Class > Method) based on your cursor.
- **Line Numbers:** Specific L-range for your selection.

#### Example Output

```text
PATH: app/MyReference.hs
REPO: user/repo (ref: a1b2c)
LOCATION: L3-L7
```

#### HOW-TO

Select a block of code, right click and select "Simple Reference"

**Hotkey:** `Ctrl`+`Alt`+`C` (Windows) / `Cmd`+`Option`+`C` (MacOS)

### Code Block References

Like Simple References but with:
- Langage Information
- Code Block.

#### Example Output:
```text
PATH: app/MyReference.hs
REPO: user/repo (ref: a1b2c)
LOCATION: L3-L7
```

```haskell
fibs :: [Integer]
fibs = 0 : 1 : zipWith (+) fibs (drop 1 fibs)

getFib :: Int -> Integer
getFib n = fibs !! n
```

#### HOW-TO

Select a block of code, right click and select "Code Block Reference"

**Hotkey:** `Ctrl`+`Alt`+`Shift`+`C` (Windows) / `Cmd`+`Option`+`Shift`+`C` (MacOS)

## Extension Settings

This extension contributes the following settings. You can find these in **File > Preferences > Settings** (or `Cmd+,` on macOS) by searching for `reference-vscode`.

### `reference-vscode.referenceStyle`
Select the format used for the metadata copied to your clipboard.

| Style | Example Output | Best Use Case |
| :--- | :--- | :--- |
| **Standard** | `PATH: src/app.ts` <br> `REPO: user/repo (ref: a1b2c)` <br> `CONTEXT: Auth > Login [L10-L15]` | Detailed documentation or internal notes. |
| **GitHubLink** | `https://github.com/user/repo/blob/a1b2c/src/app.ts#L10-L15` <br> `Auth > Login` | Code reviews or Slack/Jira comments. |
| **Minimalist** | `user/repo (a1b2c) :: src/app.ts :: Auth > Login (L10-L15)` | Quick references that fit on a single line. |

### `reference-vscode.includeGitInfo`
* **Type:** `boolean`
* **Default:** `true`
* **Description:** Toggle to include or exclude the Repository URL and Commit Hash. If no Git repository is detected, no repository information is shown.

## Requirements

- **VSCode** ^=1.110.0
- **vscode.git**: Must be enabled to fetch repo/commit data.
- **Language Extensions:** To see class/method/function names in the "context" field. Ensure you have the relevant Language Server installed. (e.g., `rust-analyzer` for Rust, `Haskell` for Haskell, `Pyright` for Python)

## Known Issues

* If no symbols are found in the file, the CONTEXT field will show line numbers only.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

* Initial release.
* Support for "Simple" (Metadata only) and "Code Block" (Markdown block) references.
* Automatic Git repository and commit detection.
* Context-aware symbol detection for nested functions and classes.

### Support

I'm happy to hear your thoughts or feature suggestions!

**Maintainer**: Sam Lloyd-Williams
**Email**: samlloydw+referencevscode@gmail.com
