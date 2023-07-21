import * as vscode from 'vscode';

const nombre = "Bibliografía";

export function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
	return {
		enableScripts: true,
		localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
	};
}


export class WebBibliog {
	public static currentPanel: WebBibliog | undefined;

	public static readonly viewType = 'catCoding';

	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];

	public static createOrShow(extensionUri: vscode.Uri) {
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		// If we already have a panel, show it.
		if (WebBibliog.currentPanel) {
			WebBibliog.currentPanel._panel.reveal(column);
			return;
		}

		// Otherwise, create a new panel.
		const panel = vscode.window.createWebviewPanel(
			WebBibliog.viewType,
			'Bibliografía',
			column || vscode.ViewColumn.One,
			getWebviewOptions(extensionUri),
		);

		WebBibliog.currentPanel = new WebBibliog(panel, extensionUri);
	}

	public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		WebBibliog.currentPanel = new WebBibliog(panel, extensionUri);
	}

	private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		this._panel = panel;
		this._extensionUri = extensionUri;

		// Set the webview's initial html content
		this._update();

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programmatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		// Update the content based on view changes
		this._panel.onDidChangeViewState(
			e => {
				if (this._panel.visible) {
					this._update();
				}
			},
			null,
			this._disposables
		);

		// Handle messages from the webview
		this._panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'alert':
						vscode.window.showErrorMessage(message.text);
						return;
				}
			},
			null,
			this._disposables
		);
	}

	public doRefactor() {
		// Send a message to the webview webview.
		// You can send any JSON serializable data.
		this._panel.webview.postMessage({ command: 'refactor' });
	}

	public dispose() {
		WebBibliog.currentPanel = undefined;

		// Clean up our resources
		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

	private _update() {
		const webview = this._panel.webview;

		// Vary the webview's content based on where it is located in the editor.
		switch (this._panel.viewColumn) {
			case vscode.ViewColumn.Two:
				this._updateForCat(webview, 'Compiling Cat');
				return;

			case vscode.ViewColumn.Three:
				this._updateForCat(webview, 'Testing Cat');
				return;

			case vscode.ViewColumn.One:
			default:
				this._updateForCat(webview, 'Bibliografía');
				return;
		}
	}

	private _updateForCat(webview: vscode.Webview, nombre: any) {
		this._panel.title = nombre;
		this._panel.webview.html = this._getHtmlForWebview(webview);
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));
		const bootstrapScriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'bootstrap.bundle.js'));

		// Do the same for the stylesheet.
		const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css'));
		const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
		const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css'));
		const styleBootstrapUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'bootstrap.css'));
		const styleBootstrapGridUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'bootstrap-grid.css'));
		

		const onDiskPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'logo_udc.gif');
		const logoSrc = webview.asWebviewUri(onDiskPath);			

		// Use a nonce to only allow a specific script to be run.
		const nonce = getNonce();

		return codigoHtml(styleBootstrapUri, styleBootstrapGridUri, 
			styleResetUri, styleVSCodeUri, styleMainUri, logoSrc,
			nonce, scriptUri, bootstrapScriptUri);
	}
}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

function codigoHtml(styleBootstrapUri: any, styleBootstrapGridUri: any, 
	styleResetUri: any, styleVSCodeUri: any, styleMainUri: any, logoSrc: any,
	nonce: any, scriptUri: any, bootstrapScriptUri: any){
	const textoHtml = `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
					Use a content security policy to only allow ruloading styles from our extension directory,
					and only allow scripts that have a specific nonce.
					(See the 'webview-sample' extension sample for img-src content security policy examples)
				-->

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${styleBootstrapUri}" rel="stylesheet">
				<link href="${styleBootstrapGridUri}" rel="stylesheet">
				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
				<link href="${styleMainUri}" rel="stylesheet">

				<title>Prueba prueba</title>
			</head>
			<body>
				<div class="container">
					<div class="row">
						<div class="col-12">
							<div class="text-center">
								<img src="${logoSrc}" class="img-fluid">
							</div>
						</div>
					</div>
					<div class="row" style="margin:10px;">
						<div class="col-12">
							<div class="text-center">
								<h1>ProgTutor</h2>
							</div>
						</div>
					</div>					
					<div class="row">
							<h1 style="margin-top:50px;">Bibliografía</h1>
							<p id="tipoDato" class="tema"><span class = "puntoTema"></span>Tipos de Datos</p>
								<p id="datoNum" class="subTema">Datos Numericos</p>
								<p id="cad" class="subTema">Cadenas</p>
							<p id="bucles" class="tema"><span class = "puntoTema"></span>Bucles</p>
								<p id="for" class="subTema">Ciclo For</p>
								<p id="while" class="subTema">Ciclo While</p>
						</div>															
					</div>			
				</div>			

				<script nonce="${nonce}" src="${scriptUri}"></script>
				<script nonce="${nonce}" src="${bootstrapScriptUri}"></script>			

			</body>
			</html>`;
	return textoHtml;
}
