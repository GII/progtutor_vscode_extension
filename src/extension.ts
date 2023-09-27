
import * as vscode from 'vscode';

import {WebPrincipal} from './webPrinc';
import {WebBibliografia} from './webBiblig';
import {WebProfesor} from './webProf';

import { GlobalVar } from './globalVar';
import { PistasVS } from './classPistas';
import { WorkMetric } from './classWorkMetric';
import { ComunicacionDB } from './classBD';




export function activate(this: any, context: vscode.ExtensionContext) {
	
	//declaracion de variables del programa----------------------------------------------------------------------------------------
	const diagnosticos = vscode.languages.createDiagnosticCollection('python');
	diagnosticos.clear();
	
	

	//crea el webview donde se muestran los botones---------------------------------------------------------------------------------
	const webPrinc = new WebPrincipal(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(WebPrincipal.viewType, webPrinc));
	
	context.subscriptions.push(
		vscode.commands.registerCommand('progtutor.libPista1', () => {
			webPrinc.libPista1();
		}));
	
	context.subscriptions.push(
		vscode.commands.registerCommand('progtutor.libPista2', () => {
			webPrinc.libPista2();
		}));
	
	context.subscriptions.push(
		vscode.commands.registerCommand('progtutor.bloqPista1', () => {
			webPrinc.bloqPista1();
		}));
	
	context.subscriptions.push(
		vscode.commands.registerCommand('progtutor.bloqPista2', () => {
			webPrinc.bloqPista2();
		}));

	context.subscriptions.push(
		vscode.commands.registerCommand('progtutor.execPista1', async () => {
			const metrica = 'editorHintCount';
			await WorkMetric.aumentarMetrica(metrica);
			PistasVS.ejecutarPista1(diagnosticos);
		}));
	
	context.subscriptions.push(
		vscode.commands.registerCommand('progtutor.execPista2', async () => {
			const metrica = 'editorHintCount';
			await WorkMetric.aumentarMetrica(metrica);
			PistasVS.ejecutarPista2(diagnosticos, context);
		}));

	context.subscriptions.push(
		vscode.commands.registerCommand('progtutor.libEvaluar', () => {
			webPrinc.libEvaluar();
		}));

	context.subscriptions.push(
		vscode.commands.registerCommand('progtutor.bloqEvaluar', () => {
			webPrinc.bloqEvaluar();
		}));
	
	context.subscriptions.push(
		vscode.commands.registerCommand('progtutor.Evaluar', async () => {
			await PistasVS.evaluarCodigo();
		}));
	
	context.subscriptions.push(
		vscode.commands.registerCommand('progtutor.respDuda',async () => {
			const metrica = 'solvedDoubtCount';
			await WorkMetric.aumentarMetrica(metrica);
		}));

	const webBib = new WebBibliografia(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(WebBibliografia.viewType, webBib));
	
	const webProff = new WebProfesor(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(WebProfesor.viewType, webProff));

	
		
	//evento que se activa cada vez que se modifica el fichero python.py-----------------------------------------------------------
	context.subscriptions.push(vscode.workspace.onDidChangeTextDocument((event) => {		
        if (event.document === vscode.window.activeTextEditor?.document) {
            WorkMetric.tiempoInactividad();
			GlobalVar.modCodigo = true;
        }
    }));

	//comando para ejecutar el archivo python--------------------------------------------------------------------------------------
	context.subscriptions.push(
		vscode.commands.registerCommand('progtutor.ejecutarArchivo', async () => {
			try {
				ejecutar(diagnosticos, context);
			  } catch (error) {
				vscode.window.showErrorMessage(`Debe cargar un reto primero`);
			  }
		})
	);

	//comando para pedirle a UNITY los datos del usuario-----------------------------------------------------------------------------
	context.subscriptions.push(
		vscode.commands.registerCommand('progtutor.comUnity', async () => {
			const [token, curso, bloque, reto] = await ComunicacionDB.obtenerDatosUsuario();
		})
	);

	//comando para refescar la página principal---------------------------------------------------------------------------------------
	context.subscriptions.push(
		vscode.commands.registerCommand('progtutor.refrecar', async () => {
			const [token, curso, bloque, reto] = await ComunicacionDB.obtenerDatosUsuario();
		})
	  );

	  //ejecutarArchivo(diagnosticos)
	  //vscode.window.showInformationMessage(`${pythonFilePath}`);
}


//se cargan los datos del reto y se ejecuta el archivo------------------------------------------------------------------------------------------
async function ejecutar(diagnosticos: any, context: vscode.ExtensionContext){
	diagnosticos.clear();
	const [token, curso, bloque, reto] = await ComunicacionDB.obtenerDatosUsuario();
	if(reto === ''){
		vscode.window.showInformationMessage(`No tiene ningún reto seleccionado`);
	}
	else{
		ejecutarArchivo(diagnosticos, context);
	}
}

//se ejecuta el archivo python en un terminal nuevo y se hace todo el proceso para capturar el error---------------------------------------------
function ejecutarArchivo(diagnosticos: any, context: vscode.ExtensionContext){
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
	  return;
	}
  
	if (editor.document.languageId !== 'python') {
	  vscode.window.showErrorMessage('Se debe seleccionar un archivo de Python.');
	  return;
	}

	const pythonFilePath = editor.document.fileName;

	const terminal = vscode.window.createTerminal({ name: 'Terminal ProgTutor' });
	terminal.sendText(`python "${pythonFilePath}"`);
    terminal.show();

	const intervalo = setInterval(() => {
		WorkMetric.revisarTexto(intervalo, editor, diagnosticos, context);
	  }, 2000);

}


//aqui poner las funciones de prueba------------------------------------------------------------------------------------------





export function deactivate() {}
