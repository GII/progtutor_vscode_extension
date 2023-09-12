import * as vscode from 'vscode';
import {aumentarMetrica} from './extension';

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
			        await aumentarMetrica(metrica);
				break;
			}
		  });

		
	}

	private _getHtmlForWebview(webview: vscode.Webview) {	
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'mainBibliog.js'));
		const bootstrapScriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'bootstrap.bundle.js'));

		const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css'));
		const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
		const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'mainBibliog.css'));
		const styleBootstrapUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'bootstrap.css'));
		const styleBootstrapGridUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'bootstrap-grid.css'));

		let iconMas: any;
		let iconMenos: any;

		const config = vscode.workspace.getConfiguration();
		const currentTheme = config.get<string>('workbench.colorTheme');
		if (currentTheme && currentTheme.includes('Dark')) {
			iconMas = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'resources/dark', 'mas.png'));
			iconMenos = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'resources/dark', 'menos.png'));
		} else {
			iconMas = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'resources/light', 'mas.png'));
			iconMenos = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'resources/light', 'menos.png'));
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
					<div>
						<p id="txtIntrod" class="tema"><img src="${iconMas}" class="icono">Introducción a Python</p>
						<p id="txtIntrod2" class="tema" style="display: none;"><img src="${iconMenos}" class="icono">Introducción a Python</p>
						<p id="tema1.1" class="subTema">Intérprete vs. Compilador</p>
						<p id="tema1.2" class="subTema">IDE</p>
						<p id="tema1.3" class="subTema">Operadores y operandos</p>
						<p id="tema1.4" class="subTema">Tipos de datos</p>
						<p id="tema1.5" class="subTema">Expresiones y sentencias</p>
						<p id="tema1.6" class="subTema">E/S básicas</p>
						<p id="txtFujo" class="tema"><img src="${iconMas}" class="icono">Control de Flujo</p>
						<p id="txtFujo2" class="tema" style="display: none;"><img src="${iconMenos}" class="icono">Control de Flujo</p>
						<p id="tema2.1" class="subTema">Expresiones lógicas</p>
						<p id="tema2.2" class="subTema">Sentencias condicionales</p>
						<p id="tema2.3" class="subTema">Sentencias iterativas</p>
						<p id="txtFunc" class="tema"><img src="${iconMas}" class="icono">Funciones</p>
						<p id="txtFunc2" class="tema" style="display: none;"><img src="${iconMenos}" class="icono">Funciones</p>
						<p id="tema3.1" class="subTema">Definición y ejecución</p>
						<p id="tema3.2" class="subTema">Variables y alcance</p>
						<p id="tema3.3" class="subTema">Argumentos</p>
						<p id="tema3.4" class="subTema">Acceso por posición</p>
						<p id="tema3.5" class="subTema">Acceso por nombre</p>
						<p id="tema3.6" class="subTema">Valores por defecto</p>
						<p id="tema3.7" class="subTema">Número variable de argumentos</p>
						<p id="txtDatos" class="tema"><img src="${iconMas}" class="icono">Contenedores de Datos</p>
						<p id="txtDatos2" class="tema" style="display: none;"><img src="${iconMenos}" class="icono">Contenedores de Datos</p>
						<p id="tema4.1" class="subTema">Secuencias</p>
						<p id="tema4.2" class="subTema">Iteradores</p>
						<p id="tema4.3" class="subTema">Comprensiones de listas</p>
						<p id="tema4.4" class="subTema">Generadores</p>
						<p id="txtFichero" class="tema"><img src="${iconMas}" class="icono">Ficheros</p>
						<p id="txtFichero2" class="tema" style="display: none;"><img src="${iconMenos}" class="icono">Ficheros</p>
						<p id="tema5.1" class="subTema">Apertura y cierre</p>
						<p id="tema5.2" class="subTema">Lectura y escritura</p>
					</div>
				</div>

				<script nonce="${nonce}" src="${scriptUri}"></script>
				<script nonce="${nonce}" src="${bootstrapScriptUri}"></script>			

			</body>
			</html>`;
	return textoHtml;
}



