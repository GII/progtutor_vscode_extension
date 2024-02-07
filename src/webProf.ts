import * as vscode from 'vscode';

export class WebProfesor implements vscode.WebviewViewProvider {
	
	public static readonly viewType = 'progtutor.profesor';
	private _view?: vscode.WebviewView;

	constructor(
		private readonly _extensionUri: vscode.Uri,
		
	) { }

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;
		
		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [
				this._extensionUri
			]
		};			

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
		
		//aqui va el codigo al presionar un boton del webview
		  webviewView.webview.onDidReceiveMessage(message => {
			switch (message.command) {
				case 'dudas':
					vscode.commands.executeCommand('progtutor.respDuda');
				break;
			}
		  });

		
	}

	private _getHtmlForWebview(webview: vscode.Webview) {	
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'mainProfesor.js'));
		const bootstrapScriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'bootstrap.bundle.js'));

		const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css'));
		const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
		const styleBootstrapUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'bootstrap.css'));
		const styleBootstrapGridUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'bootstrap-grid.css'));

		let iconMano: any;
		let styleMainUri: any;

		const config = vscode.workspace.getConfiguration();
		const currentTheme = config.get<string>('workbench.colorTheme');
		if (currentTheme && currentTheme.includes('Dark')) {
			iconMano = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'resources/dark', 'mano.png'));
			styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'mainDark.css'))
		} else {
			iconMano = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'resources/light', 'mano.png'));
			styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'mainLight.css'))
		}
		
		const nonce = getNonce();

		return codigoHtml(styleBootstrapUri, styleBootstrapGridUri, 
			styleResetUri, styleVSCodeUri, styleMainUri,
			nonce, scriptUri, bootstrapScriptUri, iconMano);
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
	styleResetUri: any, styleVSCodeUri: any, styleMainUri: any,
	nonce: any, scriptUri: any, bootstrapScriptUri: any, iconMano: any) {
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
						<div class="col-6">
							<div class="text-center">
								<button id="btn.profesor" class = "btnTransp"><img src="${iconMano}" class="iconoGrande">DUDA RESUELTA</button>
							</div>
						</div>														
					</div>					
				</div>

				<script nonce="${nonce}" src="${scriptUri}"></script>
				<script nonce="${nonce}" src="${bootstrapScriptUri}"></script>			

			</body>
			</html>`;
	return textoHtml;
}