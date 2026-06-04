import * as vscode from 'vscode';
import { WorkMetric } from './classWorkMetric';

export class WebBibliografia implements vscode.WebviewViewProvider {
	
	public static readonly viewType = 'progtutor.bibliog';
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
		  webviewView.webview.onDidReceiveMessage(async message => {
			switch (message.command) {
				case 'cargarEnlace':
					vscode.env.openExternal(vscode.Uri.parse(message.url));
					const metrica = 'documentationCheckCount';
			        await WorkMetric.aumentarMetrica(metrica);
				break;
			}
		  });

		
	}

	private _getHtmlForWebview(webview: vscode.Webview) {	
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'mainBibliog.js'));
		const bootstrapScriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'bootstrap.bundle.js'));

		const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css'));
		const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
		const styleBootstrapUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'bootstrap.css'));
		const styleBootstrapGridUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'bootstrap-grid.css'));

		let iconMas: any;
		let iconMenos: any;
		let styleMainUri: any;

		const config = vscode.workspace.getConfiguration();
		const currentTheme = config.get<string>('workbench.colorTheme');
		if (currentTheme && currentTheme.includes('Dark')) {
			iconMas = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'resources/dark', 'mas.png'));
			iconMenos = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'resources/dark', 'menos.png'));
			styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'mainBibliogDark.css'));
		} else {
			iconMas = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'resources/light', 'mas.png'));
			iconMenos = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'resources/light', 'menos.png'));
			styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'mainBibliogLigth.css'));
		}
		
		const nonce = getNonce();

		return codigoHtml(styleBootstrapUri, styleBootstrapGridUri, 
			styleResetUri, styleVSCodeUri, styleMainUri,
			nonce, scriptUri, bootstrapScriptUri, iconMas, iconMenos);
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
	nonce: any, scriptUri: any, bootstrapScriptUri: any, iconMas: any, iconMenos: any){
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
						<div><p id="txtClase" class="tema"><img src="${iconMas}" class="icono">Classes</p>
						<p id="txtClase2" class="tema" style="display: none;"><img src="${iconMenos}" class="icono">Classes</p>
							<p id="tema0.1" class="subTemaPrinc">Variables and expressions</p>
							<p id="tema0.2" class="subTemaPrinc">Input / Output</p>
							<p id="tema0.3" class="subTemaPrinc">Conditionals</p>
							<p id="tema0.4" class="subTemaPrinc">Loops I</p>
							<p id="tema0.5" class="subTemaPrinc">Loops II</p>
							<p id="tema0.6" class="subTemaPrinc">Functions I</p>
							<p id="tema0.7" class="subTemaPrinc">Functions II</p>
							<p id="tema0.8" class="subTemaPrinc">Lists</p>
							<p id="tema0.9" class="subTemaPrinc">Files</p>

						<div><p id="txtSec" class="tema"><img src="${iconMas}" class="icono">Detailed Topics</p>
						<p id="txtSec2" class="tema" style="display: none;"><img src="${iconMenos}" class="icono">Detailed Topics</p>

						<p id="txtES" class="subTema"><img src="${iconMas}" class="icono">Input / Output</p>
						<p id="txtES2" class="subTema" style="display: none;"><img src="${iconMenos}" class="icono">Input / Output</p>
							<p id="tema1.1" class="subTema2">Instructions</p>
							<p id="tema1.2" class="subTema2">Basic Syntax</p>
							<p id="tema1.3" class="subTema2">Variable Declaration</p>
							<p id="tema1.4" class="subTema2">Data Types</p>
							<p id="tema1.5" class="subTema2">Operators and Operands</p>

						<p id="txtCond" class="subTema"><img src="${iconMas}" class="icono">Conditionals</p>
						<p id="txtCond2" class="subTema" style="display: none;"><img src="${iconMenos}" class="icono">Conditionals</p>
							<p id="tema2.2" class="subTema2">Conditionals if, else, elif</p>

						<p id="txtBucles" class="subTema"><img src="${iconMas}" class="icono">Loops</p>
						<p id="txtBucles2" class="subTema" style="display: none;"><img src="${iconMenos}" class="icono">Loops</p>
							<p id="tema3.1" class="subTema2">For Loops</p>
							<p id="tema3.2" class="subTema2">While Loops</p>
							<p id="tema3.3" class="subTema2">Range Function</p>

						<p id="txtFunc" class="subTema"><img src="${iconMas}" class="icono">Functions</p>
						<p id="txtFunc2" class="subTema" style="display: none;"><img src="${iconMenos}" class="icono">Functions</p>
							<p id="tema4.1" class="subTema2">Function</p>
							<p id="tema4.2" class="subTema2">Passing by Value and Reference</p>
							<p id="tema4.3" class="subTema2">Annotations</p>

						<p id="txtListas" class="subTema"><img src="${iconMas}" class="icono">Lists</p>
						<p id="txtListas2" class="subTema" style="display: none;"><img src="${iconMenos}" class="icono">Lists</p>
							<p id="tema5.1" class="subTema2">Lists</p>
							<p id="tema5.2" class="subTema2">Tuples</p>
						
						<p id="txtFichero" class="subTema"><img src="${iconMas}" class="icono">Files</p>
						<p id="txtFichero2" class="subTema" style="display: none;"><img src="${iconMenos}" class="icono">Files</p>
							<p id="tema6.1" class="subTema2">Reading Files</p>
							<p id="tema6.2" class="subTema2">Writing Files</p>
						
						<div><p id="txtRobobo" class="tema"><img src="${iconMas}" class="icono">Robobo Methods</p>
						<p id="txtRobobo2" class="tema" style="display: none;"><img src="${iconMenos}" class="icono">Robobo Methods</p>
							<p id="fx1" class="subTemaPrinc">movePanTo</p>
							<p id="fx2" class="subTemaPrinc">moveTiltTo</p>
							<p id="fx3" class="subTemaPrinc">moveWheels</p>
							<p id="fx4" class="subTemaPrinc">moveWheelsByTime</p>
							<p id="fx5" class="subTemaPrinc">playNote</p>
							<p id="fx6" class="subTemaPrinc">playSound</p>
							<p id="fx7" class="subTemaPrinc">readColorBlob</p>
							<p id="fx8" class="subTemaPrinc">readIRSensor</p>
							<p id="fx9" class="subTemaPrinc">readOrientationSensor</p>
							<p id="fx10" class="subTemaPrinc">readPanPosition</p>
							<p id="fx11" class="subTemaPrinc">readQR</p>
							<p id="fx12" class="subTemaPrinc">readWheelPosition</p>
							<p id="fx13" class="subTemaPrinc">resetColorBlobs</p>
							<p id="fx14" class="subTemaPrinc">sayText</p>
							<p id="fx15" class="subTemaPrinc">setActiveBlobs</p>
							<p id="fx16" class="subTemaPrinc">setEmotionTo</p>
							<p id="fx17" class="subTemaPrinc">setLedColorTo</p>
							<p id="fx18" class="subTemaPrinc">stopMotors</p>
							<p id="fx19" class="subTemaPrinc">wait</p>
							
					</div>
				</div>

				<script nonce="${nonce}" src="${scriptUri}"></script>
				<script nonce="${nonce}" src="${bootstrapScriptUri}"></script>			

			</body>
			</html>`;
	return textoHtml;
}



