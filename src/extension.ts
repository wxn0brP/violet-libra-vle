import type * as Vscode from "vscode";

interface PublishConfig {
    url: string;
    query?: Record<string, string>;
    headers?: Record<string, string>;
}

interface FileMeta {
    name: string;
    tags?: string[];
    desc?: string;
    private?: boolean;
    scheduled?: number;
}

export async function activate(context: Vscode.ExtensionContext) {
    const vscode = await import("vscode");

    const disposable = vscode.commands.registerCommand("nya.publishMarkdown", async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage("No active file to publish.");
            return;
        }

        const filePath = editor.document.fileName;
        const fs = await import("fs");
        const fileContent = fs.readFileSync(filePath, "utf-8");

        const [metaBlock, ...contentParts] = fileContent.split(";;;");
        if (!metaBlock) {
            vscode.window.showErrorMessage("Metadata block missing (JSON before ;;;).");
            return;
        }

        let meta: FileMeta;
        try {
            meta = JSON.parse(metaBlock);
        } catch (err) {
            vscode.window.showErrorMessage("Invalid JSON metadata: " + err);
            return;
        }

        const content = contentParts.join(";;;").trim();
        if (!content) {
            vscode.window.showErrorMessage("File content is empty.");
            return;
        }

        const config = await getConfig(vscode);
        if (!config) return;

        const updater: any = {
            content,
            tags: meta.tags || [],
            desc: meta.desc || "",
            $unset: {}
        };

        if (meta.private) updater.private = true;
        else updater.$unset.private = true;

        if (meta.scheduled && meta.scheduled > Date.now()) updater.scheduled = meta.scheduled;
        else updater.$unset.scheduled = true;

        try {
            const res = await fetchVQL(config, {
                db: "api-cms-admin",
                d: {
                    updateOneOrAdd: {
                        collection: "md",
                        search: { id: meta.name },
                        updater
                    }
                }
            });

            vscode.window.showInformationMessage(res?.err ? "Error: " + res.err : "Published successfully.");
        } catch (err) {
            vscode.window.showErrorMessage("Upload failed: " + err);
        }
    });

    context.subscriptions.push(disposable);

}

async function getConfig(vscode: typeof Vscode): Promise<PublishConfig | null> {
    if (!vscode.workspace.workspaceFolders) return null;
    const fs = await import("fs");
    const path = await import("path");

    const rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const configPath = path.join(rootPath, "publish-config.json");

    if (!fs.existsSync(configPath)) {
        vscode.window.showWarningMessage("publish-config.json not found in project root.");
        return null;
    }

    try {
        const raw = fs.readFileSync(configPath, "utf-8");
        const config = JSON.parse(raw) as PublishConfig;
        return config;
    } catch (err) {
        vscode.window.showErrorMessage("Error reading publish-config.json: " + err);
        return null;
    }
}

async function fetchVQL(config: PublishConfig, payload: any): Promise<any> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(config.headers || {})
    };

    const query = new URLSearchParams();
    const queryConfig = config.query || {};
    for (const key in queryConfig) {
        query.append(key, queryConfig[key]);
    }

    const response = await fetch(config.url + "?" + query.toString(), {
        method: "POST",
        headers,
        body: JSON.stringify({
            query: payload
        })
    }).then(res => res.json());

    return response;
}

export function deactivate() { }
