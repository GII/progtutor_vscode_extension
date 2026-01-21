
import * as vscode from 'vscode';

import {WebPrincipal} from './webPrinc';
import {WebBibliografia} from './webBiblig';
import { GlobalVar } from './globalVar';
import { PistasVS } from './classPistas';
import { WorkMetric } from './classWorkMetric';
import { ComunicacionDB } from './classBD';
import {WebProfesor} from './webProf';
import * as os from 'os';




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
		vscode.commands.registerCommand('progtutor.respDuda',async () => {
			const result = await vscode.window.showInformationMessage("¿Como PROFESOR ha ayudado al estudiante?",{ modal: true },"SI");
			if (result === "SI") {
				vscode.window.showInformationMessage('SU DUDA HA SIDO RESUELTA');
			const metrica = 'solvedDoubtCount';
			await WorkMetric.aumentarMetrica(metrica);
			}			
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
			const result = await vscode.window.showInformationMessage("¿Estas seguro que deseas evaluar el reto?",{ modal: true },"Aceptar");
			if (result === "Aceptar") {
				vscode.window.showInformationMessage('EVALUACIÓN EN CURSO, REVISE EL SIMULADOR PARA MÁS DETALLES');
				await PistasVS.evaluarCodigo();
			}
		}));
	
	context.subscriptions.push(
		vscode.commands.registerCommand('progtutor.salvarArchivo', async () => {
			await PistasVS.salvarCodigo();
			vscode.window.showInformationMessage('ARCHIVO GUARDADO CORRECTAMENTE');
		}));

	context.subscriptions.push(
		vscode.commands.registerCommand('progtutor.descargarArchivo', async () => {
			await PistasVS.cargarCodigo();
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
				ComunicacionDB.bloquearRobot();
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
}


//se cargan los datos del reto y se ejecuta el archivo------------------------------------------------------------------------------------------
async function ejecutar(diagnosticos: any, context: vscode.ExtensionContext){
	diagnosticos.clear();
	const [token, curso, bloque, reto] = await ComunicacionDB.obtenerDatosUsuario();
	if(reto === ''){
		vscode.window.showInformationMessage(`No tiene ningún reto seleccionado`);
	}
	else{
		try {
			await ComunicacionDB.desbloquearRobot();
			await ejecutarArchivo(diagnosticos, context);
		} catch (error) {
			vscode.window.showErrorMessage('Error durante la ejecución del reto');
			await ComunicacionDB.bloquearRobot();
		}
	}
}

//se ejecuta el archivo python en un terminal nuevo y se hace todo el proceso para capturar el error---------------------------------------------
async function ejecutarArchivo(diagnosticos: any, context: vscode.ExtensionContext): Promise<void>{
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
	  return;
	}
  
	if (editor.document.languageId !== 'python') {
	  vscode.window.showErrorMessage('Se debe seleccionar un archivo de Python.');
	  return;
	}

	await editor.document.save();
	const pythonFilePath = editor.document.fileName;

	vscode.window.terminals.forEach(terminal => {terminal.dispose();});

	const terminal = vscode.window.createTerminal({ name: 'Terminal ProgTutor' });

	const platform = os.platform();
	if (platform === "win32"){
		terminal.sendText(`python "${pythonFilePath}"`);
	}else if(platform === "linux"){
		terminal.sendText(`/bin/python3 "${pythonFilePath}"`);
	}else{
		terminal.sendText(`python3 "${pythonFilePath}"`);
	}
    terminal.show();

	const intervalo = setInterval(() => {
		WorkMetric.revisarTexto(intervalo, editor, diagnosticos, context);
	  }, 2000);

}


//aqui poner las funciones de prueba------------------------------------------------------------------------------------------





export function deactivate() {}
