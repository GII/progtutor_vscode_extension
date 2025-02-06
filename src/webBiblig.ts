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
						<div><p id="txtClase" class="tema"><img src="${iconMas}" class="icono">Clases</p>
						<p id="txtClase2" class="tema" style="display: none;"><img src="${iconMenos}" class="icono">Clases</p>
							<p id="tema0.1" class="subTemaPrinc">Variables y expresiones</p>
							<p id="tema0.2" class="subTemaPrinc">Entrada / Salida</p>
							<p id="tema0.3" class="subTemaPrinc">Condicionales</p>
							<p id="tema0.4" class="subTemaPrinc">Bucles I</p>
							<p id="tema0.5" class="subTemaPrinc">Bucles II</p>
							<p id="tema0.6" class="subTemaPrinc">Funciones I</p>
							<p id="tema0.7" class="subTemaPrinc">Funciones II</p>
							<p id="tema0.8" class="subTemaPrinc">Listas</p>
							<p id="tema0.9" class="subTemaPrinc">Ficheros</p>

						<div><p id="txtSec" class="tema"><img src="${iconMas}" class="icono">Temas Detallados</p>
						<p id="txtSec2" class="tema" style="display: none;"><img src="${iconMenos}" class="icono">Temas Detallados</p>

						<p id="txtES" class="subTema"><img src="${iconMas}" class="icono">Entrada / Salida</p>
						<p id="txtES2" class="subTema" style="display: none;"><img src="${iconMenos}" class="icono">Entrada / Salida</p>
							<p id="tema1.1" class="subTema2">Intrucciones</p>
							<p id="tema1.2" class="subTema2">Sintaxis básica</p>
							<p id="tema1.3" class="subTema2">Declaración de variables</p>
							<p id="tema1.4" class="subTema2">Tipos de datos</p>
							<p id="tema1.5" class="subTema2">Operadores y operandos</p>

						<p id="txtCond" class="subTema"><img src="${iconMas}" class="icono">Condicionales</p>
						<p id="txtCond2" class="subTema" style="display: none;"><img src="${iconMenos}" class="icono">Condicionales</p>
							<p id="tema2.2" class="subTema2">Condiciones if, else, elif</p>

						<p id="txtBucles" class="subTema"><img src="${iconMas}" class="icono">Bucles</p>
						<p id="txtBucles2" class="subTema" style="display: none;"><img src="${iconMenos}" class="icono">Bucles</p>
							<p id="tema3.1" class="subTema2">Bucles For</p>
							<p id="tema3.2" class="subTema2">Bucles While</p>
							<p id="tema3.3" class="subTema2">Uso del Range</p>

						<p id="txtFunc" class="subTema"><img src="${iconMas}" class="icono">Funciones</p>
						<p id="txtFunc2" class="subTema" style="display: none;"><img src="${iconMenos}" class="icono">Funciones</p>
							<p id="tema4.1" class="subTema2">Función</p>
							<p id="tema4.2" class="subTema2">Paso por valor y referencia</p>
							<p id="tema4.3" class="subTema2">Anotaciones</p>

						<p id="txtListas" class="subTema"><img src="${iconMas}" class="icono">Listas</p>
						<p id="txtListas2" class="subTema" style="display: none;"><img src="${iconMenos}" class="icono">Listas</p>
							<p id="tema5.1" class="subTema2">Listas</p>
							<p id="tema5.2" class="subTema2">Tuplas</p>
						
						<p id="txtFichero" class="subTema"><img src="${iconMas}" class="icono">Ficheros</p>
						<p id="txtFichero2" class="subTema" style="display: none;"><img src="${iconMenos}" class="icono">Ficheros</p>
							<p id="tema6.1" class="subTema2">Leer archivos</p>
							<p id="tema6.2" class="subTema2">Escribir archivos</p>
						
						<div><p id="txtRobobo" class="tema"><img src="${iconMas}" class="icono">Métodos Robobo</p>
					</div>
				</div>

				<script nonce="${nonce}" src="${scriptUri}"></script>
				<script nonce="${nonce}" src="${bootstrapScriptUri}"></script>			

			</body>
			</html>`;
	return textoHtml;
}



