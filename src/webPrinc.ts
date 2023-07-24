import * as vscode from 'vscode';

export class WebPrincipal implements vscode.WebviewViewProvider {

	public static readonly viewType = 'progtutor.principal';
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
				case 'execute':
					vscode.commands.executeCommand('progtutor.ejecutarArchivo');
					break;
				case 'actualizar':
					vscode.commands.executeCommand('progtutor.comUnity');
					vscode.window.showInformationMessage(`Página actualizada`);
					break;
			}
		});


	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		vscode.commands.executeCommand('progtutor.comUnity');
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));
		const bootstrapScriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'bootstrap.bundle.js'));

		const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css'));
		const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
		const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css'));
		const styleBootstrapUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'bootstrap.css'));
		const styleBootstrapGridUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'bootstrap-grid.css'));

		const nonce = getNonce();

		let iconPlay: any;
		let iconEval: any;
		let iconPista: any;

		const config = vscode.workspace.getConfiguration();
		const currentTheme = config.get<string>('workbench.colorTheme');
		if (currentTheme && currentTheme.includes('Dark')) {
			iconPlay = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'resources/dark', 'play.png'));
			iconEval = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'resources/dark', 'evaluar.png'));
			iconPista = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'resources/dark', 'pista.png'));
		} else {
			iconPlay = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'resources/light', 'play.png'));
			iconEval = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'resources/light', 'evaluar.png'));
			iconPista = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'resources/light', 'pista.png'));
		}


		return codigoHtml(styleBootstrapUri, styleBootstrapGridUri,
			styleResetUri, styleVSCodeUri, styleMainUri,
			nonce, scriptUri, bootstrapScriptUri, iconPlay, iconEval, iconPista);
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
	nonce: any, scriptUri: any, bootstrapScriptUri: any, iconPlay: any, iconEval: any, iconPista: any) {
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
								<button id="btn.ejecutar" class = "btnTransp"><img src="${iconPlay}" class="iconoGrande">PROBAR EJERCICIO</button>
							</div>
						</div>	
						<div class="col-6">
							<div class="text-center">
								<button id="btn.evaluar" class = "btnTransp"><img src="${iconEval}" class="iconoGrande">EVALUAR EJERCICIO</button>
							</div>
						</div>														
					</div>
					<p class="pista">PISTAS</p>
					<hr class="hr">

					<div class="row">
						<div class="col-12 text-start">
							<button id="btn.pista1" class="btnTransp2">
								<div class="row";>
									<div class="col-5"><img src="${iconPista}" class="iconoGrande2"></div>
									<div class="col-7" style="padding:0px;">
										<div  class="row" >
											<p style="color: rgb(200, 202, 199);">PISTA 1</p>
										</div>
										<div  class="row">
											<p style="color: rgb(200, 202, 199);">Ubicación del error</p>
										</div>
									</div>
								</div>
							</button>
						</div>															
					</div>

					<div class="row">
						<div class="col-12 text-start">
							<button id="btn.pista2" class="btnTransp2">
								<div class="row";>
									<div class="col-5"><img src="${iconPista}" class="iconoGrande2"></div>
									<div class="col-7" style="padding:0px;">
										<div  class="row" >
											<p style="color: rgb(200, 202, 199);">PISTA 2</p>
										</div>
										<div  class="row">
											<p style="color: rgb(200, 202, 199);">Explicación del error</p>
										</div>
									</div>
								</div>
							</button>
						</div>															
					</div>
				</div>

				
			


				<script nonce="${nonce}" src="${scriptUri}"></script>
				<script nonce="${nonce}" src="${bootstrapScriptUri}"></script>			

			</body>
			</html>`;
	return textoHtml;
}



