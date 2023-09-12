
import * as vscode from 'vscode';
import {escribirMetrica} from './dB';
import {leerMetrica} from './dB';
import {obtenerToken} from './dB';
import {obtenerTema} from './dB';
import {evualarCodigo} from './dB';
import {WebPrincipal} from './webPrinc';
import {WebBibliografia} from './webBiblig';
import {WebProfesor} from './webProf';
import * as fs from 'fs';

let lineaError: number = 0;
let tiempoInicial: number = 0;
const umbralTiempoInact: number = 5;
const umbralPistaGPT: number = 2;
const umbralPistaLinea: number = 4;
let permisoLibPista1: boolean = false;
let permisoLibPista2: boolean = false;
let contErrorConsec1: number = 0;
let contErrorConsec2: number = 0;
const umbralCantError = 2;
let nombreError: string = ''; 
let modCodigo: boolean = false;


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
			await aumentarMetrica(metrica);
			ejecutarPista1(diagnosticos);
		}));
	
	context.subscriptions.push(
		vscode.commands.registerCommand('progtutor.execPista2', async () => {
			const metrica = 'editorHintCount';
			await aumentarMetrica(metrica);
			ejecutarPista2(diagnosticos, context);
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
			await evaluarCodigo();
		}));
	
	context.subscriptions.push(
		vscode.commands.registerCommand('progtutor.respDuda',async () => {
			const metrica = 'solvedDoubtCount';
			await aumentarMetrica(metrica);
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
            tiempoInactividad();
			modCodigo = true;
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
			const [token, curso, bloque, reto] = await cargarDatosUsuario();
		})
	);

	//comando para refescar la página principal---------------------------------------------------------------------------------------
	context.subscriptions.push(
		vscode.commands.registerCommand('progtutor.refrecar', async () => {
			const [token, curso, bloque, reto] = await cargarDatosUsuario();
		})
	  );

	


	  //ejecutarArchivo(diagnosticos)
	  //vscode.window.showInformationMessage(`${pythonFilePath}`);
}





//se cargan los datos de token, curso y reto----------------------------------------------------------------------------------------------------
async function cargarDatosUsuario(): Promise<[string, string, string, string]> {
	try {
	  const responseToken = await obtenerToken();
	  
	  if (responseToken.data.code !== 200) {
		vscode.window.showErrorMessage('Debe abrir primero el simulador y cargar un reto');
	  }
	  
	  const token = responseToken.data.data.userAuthToken;
	  const responseTema = await obtenerTema();
	  const curso = responseTema.data.data.challenge.CourseId;
	  const bloque = responseTema.data.data.challenge.BlockId;
	  const reto = responseTema.data.data.challenge.ChallengeId;
	  
	  return [token, curso, bloque, reto];
	} catch (error) {
		vscode.window.showErrorMessage('Debe abrir primero el simulador y cargar un reto');
		return ['', '', '', ''];
	}
  }

//se cargan los datos del reto y se ejecuta el archivo------------------------------------------------------------------------------------------
async function ejecutar(diagnosticos: any, context: vscode.ExtensionContext){
	diagnosticos.clear();
	const [token, curso, bloque, reto] = await cargarDatosUsuario();
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
		revisarTexto(intervalo, editor, diagnosticos, context);
	  }, 2000);

}

//hace todo el procesamiento de los datos y revisa el texto---------------------------------------------------------------------------------------
async function revisarTexto(intervalo: any, editor: any, diagnosticos: any, context: vscode.ExtensionContext){
	const terminal = vscode.window.activeTerminal;
	let miString: string = "";
	
	if (terminal) {
	  vscode.commands.executeCommand('workbench.action.terminal.selectAll');
	  vscode.commands.executeCommand('editor.action.clipboardCopyAction');
	  
	  const texto = await vscode.env.clipboard.readText();
	  miString = texto.toString();
  
	  const finalizado = buscarFinalTerminal(miString);
  
	  if (finalizado === true) {
		clearInterval(intervalo);
  
		if (miString.search("Error") !== -1) {
			await tratarError(miString, editor, diagnosticos, context);
		} else {
			vscode.window.showInformationMessage(`¡NO HAY ERROR!`);
			vscode.commands.executeCommand('progtutor.libEvaluar');
			diagnosticos.clear();
		}
	  }
	  
	  await vscode.env.clipboard.writeText('');
	}
}

//tratamiento del error, guardado en base de datos-------------------------------------------------------------------------------------
async function tratarError(miString: string, editor: any, diagnosticos: any, context: vscode.ExtensionContext) {
	try {
	  let [mensajeError, ubicacionError, nombreError] = obtenerError(miString);
	  mostrarPistas(ubicacionError);
	  const codMod = guardarTipoError(nombreError);
	  
	  const [token, curso, bloque, reto] = await cargarDatosUsuario();
	  mostrarDiagnostico(bloque, mensajeError, ubicacionError - 1, editor, diagnosticos, context);
  
	  const responseLeerMetrica = await leerMetrica(token, curso, bloque, reto);
	  const datos = crearDatosGuardar(responseLeerMetrica.data, codMod);
  
	  const responseEscribirMetrica = await escribirMetrica(token, curso, bloque, reto, datos);
	  if (responseEscribirMetrica.data.code !== 200) {
		vscode.window.showErrorMessage('ERROR EN LA BASE DE DATOS.');
	  }
	} catch (error) {
	  vscode.window.showErrorMessage(`${error}`);
	}
  }

//se obtiene el codigo del error y la explicación-------------------------------------------------------------------------------------------------
function obtenerError(msgError: string) :[string, number, string]{
	const resultado: string[] = msgError.split(/[ \n,]+/);	   
	let n1 = -1;
	let n2 = -1;
	let valor = 5;
	let error = "";
	let linea = 0;
	let codigoError = "";
	  
	for (let i = 0; i < resultado.length; i++){
		n1 = resultado[i].search("Error");
		n2 = resultado[i].search("line");
		if(n1 !== -1){
			valor = i;
			codigoError = resultado[i].slice(0, resultado[i].length - 1);;
		}

		if(n2 !== -1){
			linea = parseInt(resultado[i + 1]);
		}
	}

	for (let i = valor; i < resultado.length; i++){
		if(resultado[i] === "PS"){
			break;
		}
		error = error + " " + resultado[i] + " ";
	}

	return [error, linea, codigoError];
}

//se busca si el terminal ha finalizado su ejecución----------------------------------------------------------------------------------------------
function buscarFinalTerminal(texto: string) :boolean{
	const palabra = "PS";
	let finalizado = false;
	const regex = new RegExp('\\b' + palabra + '\\b', 'gi');
	const coincidencias = texto.match(regex);
	if(coincidencias?.length === 2){
		finalizado = true;
	}
	return finalizado;
}

//se crea una ventana de diagnostico con el mensaje a mostrar-------------------------------------------------------------------------------------
async function mostrarDiagnostico(bloque: string, mensaje: string, linea: number, editor: any, diagnosticos: any, context: vscode.ExtensionContext){
	const lineaCodigo = editor.document.lineAt(linea);
    const texto = lineaCodigo.text;
	let columna = texto.length + 1;
	const bloqueId = parseInt(bloque, 10);
	if(bloqueId <= umbralPistaGPT){
		const mensajeGPT = await leerExplicGPT(mensaje, context);
		mensajeDiagnostico(mensajeGPT, linea, editor, diagnosticos, columna);
	}else if(bloqueId > umbralPistaGPT && bloqueId <= umbralPistaLinea){
		permisoLibPista2 = true;
		mensajeDiagnostico(mensaje, linea, editor, diagnosticos, columna);
	}else{
		permisoLibPista1 = true;
		permisoLibPista2 = true;
		diagnosticos.clear();
	}	
}

function mensajeDiagnostico(mensaje: string, linea: number, editor: any, diagnosticos: any, columna: number){
	vscode.window.showErrorMessage(`TIENE UN ERROR EN LA LÍNEA ${linea + 1}, REVISE EL CÓDIGO`);
	const range = new vscode.Range(new vscode.Position(linea, 0), new vscode.Position(linea, columna));
	const diag = new vscode.Diagnostic(range, mensaje, vscode.DiagnosticSeverity.Error);
	diagnosticos.set(editor.document.uri, [diag]);
}

//captura el tiempo de inactividad en pantalla y todas las métricas de tiempo---------------------------------------------------------
function tiempoInactividad(){
	vscode.commands.executeCommand('progtutor.bloqEvaluar');
	const tiempo = new Date();
	if(tiempoInicial === 0){
		tiempoInicial = (tiempo.getHours() * 3600) + (tiempo.getMinutes() * 60) + tiempo.getSeconds();
	}

	const tiempoFinal = (tiempo.getHours() * 3600) + (tiempo.getMinutes() * 60) + tiempo.getSeconds();
	const tiempoTrans = tiempoFinal - tiempoInicial;

	if(tiempoTrans > umbralTiempoInact){
		tratarTiempos(tiempoTrans);
		tiempoInicial = tiempoFinal;
	}
}

//tratamiento de los tiempos y guardado en la base de datos---------------------------------------------------------------------------
async function tratarTiempos(tiempoTrans: number){
	try{
		const [token, curso, bloque, reto] = await cargarDatosUsuario();
		const responseLeerMetrica = await leerMetrica(token, curso, bloque, reto);
		let cantPausas = responseLeerMetrica.data.data.pauseCount + 1;
		let tiempoTotal = responseLeerMetrica.data.data.totalTime + tiempoTrans;
		let tiempoMin = responseLeerMetrica.data.data.minTime;
		if(tiempoMin === 0){
			tiempoMin = tiempoTrans;
		}else{
			if(tiempoMin > tiempoTrans){
				tiempoMin = tiempoTrans;
			}
		}
		let tiempoMax = responseLeerMetrica.data.data.maxTime;
		if(tiempoMax < tiempoTrans){
			tiempoMax = tiempoTrans;
		}
		let tiempoMedio = tiempoTotal / cantPausas;
		const datos: any = {};
		datos['pauseCount'] = cantPausas;
		datos['totalTime'] = tiempoTotal;
		datos['minTime'] = tiempoMin;
		datos['maxTime'] = tiempoMax;
		datos['avgTime'] = tiempoMedio;
		const responseEscribirMetrica = await escribirMetrica(token, curso, bloque, reto, datos);
		if (responseEscribirMetrica.data.code !== 200){
			vscode.window.showErrorMessage('ERROR EN LA BASE DE DATOS.');
		}
	}catch(error){
		vscode.window.showErrorMessage('ERROR EN LA BASE DE DATOS.');
	}
}

//convierte el codigo de error en uno apto para guardar en la BD----------------------------------------------------------------------
function guardarTipoError(codigoError: string) :string{
	codigoError = codigoError.charAt(0).toLowerCase() + codigoError.slice(1);
	codigoError = codigoError + 'Count';
	return codigoError;
}

//crea un nuevo dato del objeto para guardar en la BD el codigo de Error-------------------------------------------------------------
function crearDatosGuardar(resp: any, codMod: string): any{
	let error = resp.data.errorCount + 1;
	const datos: any = {};
	datos['errorCount'] = error;
	let errorCodigo = resp.data[codMod] + 1;
	datos[codMod] = errorCodigo;
	return datos;
}

//muestra el mensaje creado por chat gpt-----------------------------------------------------------------------------------------------
async function leerExplicGPT(mensaje: string, context: vscode.ExtensionContext) :Promise<string>{
	const tipoError = mensaje.split(":")[0].trim();
	const nom = vscode.Uri.file(context.extensionPath + '/media/' + tipoError + '.txt');
	const dir = nom.fsPath;
	return new Promise((resolve, reject) => {
		fs.readFile(dir, 'utf8', (err, data) => {
		  if (err) {
			reject(err);
			return;
		  }
		  const msg = mensaje + "\n" + data;
		  resolve(msg);
		});
	});
}

//controla el estado de los botones de pistas segun la cantidad de ejecuciones---------------------------------------------------------
function mostrarPistas(linea: number){
	if(lineaError === 0){
		lineaError = linea;
	}else{
		if(lineaError === linea){
			if(modCodigo === true && permisoLibPista1 === true && permisoLibPista2 === true){
				contErrorConsec1 = contErrorConsec1 + 1;
				contErrorConsec2 = contErrorConsec2 + 1;
				modCodigo = false;
			}
			if(modCodigo === true && permisoLibPista2 === true){
				contErrorConsec2 = contErrorConsec2 + 1;
				modCodigo = false;
			}
			
			if(contErrorConsec1 > umbralCantError){
				vscode.commands.executeCommand('progtutor.libPista1');
				vscode.commands.executeCommand('progtutor.libPista2');
				vscode.window.showInformationMessage(`Veo que no encuentras la solución, tienes libre una pista para usar`);
			}
			if(contErrorConsec2 > umbralCantError){
				vscode.commands.executeCommand('progtutor.libPista2');
				vscode.window.showInformationMessage(`Veo que no encuentras la solución, tienes libre una pista para usar`);
			}
		}else{
			lineaError = linea;
			contErrorConsec1 = 0;
			contErrorConsec2 = 0;
			modCodigo = false;
			vscode.commands.executeCommand('progtutor.bloqPista1');
			vscode.commands.executeCommand('progtutor.bloqPista2');
		}
		
	}
	
}

//obtiene el mensaje de la pista y la ubicación---------------------------------------------------------------------------------------
async function mensajePista() :Promise<[string, number, number, any]> {
	const terminal = vscode.window.activeTerminal;
	let miString: string = "";
	
	if (terminal) {
	  vscode.commands.executeCommand('workbench.action.terminal.selectAll');
	  vscode.commands.executeCommand('editor.action.clipboardCopyAction');
	  
	  const texto = await vscode.env.clipboard.readText();
	  miString = texto.toString();
	  await vscode.env.clipboard.writeText('');
	}

	const [mensajeError, ubicacionError, nombreError] = obtenerError(miString);
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
	  return ['',0,0,''];
	}
	const lineaCodigo = editor.document.lineAt(ubicacionError - 1);
    const texto = lineaCodigo.text;
	let columna = texto.length + 1;
	return [mensajeError, ubicacionError, columna, editor]
}

//ejecuta la pista 1 mostrando el mensaje reducido-------------------------------------------------------------------------------------
async function ejecutarPista1(diagnosticos: any){
	const [mensajeError, ubicacionError, columna, editor] = await mensajePista();
	mensajeDiagnostico(mensajeError, ubicacionError-1, editor, diagnosticos, columna);
}

//ejecuta la pista 2 mostrando el mensaje ampliado-------------------------------------------------------------------------------------
async function ejecutarPista2(diagnosticos: any, context: vscode.ExtensionContext){
	const [mensajeError, ubicacionError, columna, editor] = await mensajePista();
	const mensajeGPT = await leerExplicGPT(mensajeError, context);
	mensajeDiagnostico(mensajeGPT, ubicacionError-1, editor, diagnosticos, columna);
}

//se actualiza la metrica cada vez que el profesor resuelve una duda-------------------------------------------------------------------
export async function aumentarMetrica(metrica: string){
	const [token, curso, bloque, reto] = await cargarDatosUsuario();
	const responseLeerMetrica = await leerMetrica(token, curso, bloque, reto);
	const datos: any = {};
	//datos['solvedDoubtCount'] = responseLeerMetrica.data.data.solvedDoubtCount + 1;
	datos[metrica] = responseLeerMetrica.data.data[metrica] + 1;

	const responseEscribirMetrica = await escribirMetrica(token, curso, bloque, reto, datos);
	if (responseEscribirMetrica.data.code !== 200) {
		vscode.window.showErrorMessage('ERROR EN LA BASE DE DATOS.');
	}
}

async function evaluarCodigo() {
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		const dato: any = {};
		const textoGuardado = editor.document.getText().replace(/\n/g, '\n');
		dato['submittedCode'] = textoGuardado;
		const [token, curso, bloque, reto] = await cargarDatosUsuario();
		const responseEscribirMetrica = await evualarCodigo(token, curso, bloque, reto, dato);
		if (responseEscribirMetrica.data.code !== 200) {
			vscode.window.showErrorMessage('ERROR EN LA BASE DE DATOS.');
		}
		if (responseEscribirMetrica.data.code === 200) {
			vscode.window.showInformationMessage('DATOS COPIADOS CORRECTAMENTE.');
		}

		}else {
		vscode.window.showErrorMessage('No hay un editor activo.');
	}
  }

//aqui poner las funciones de prueba------------------------------------------------------------------------------------------




async function revisionBibliog(){
	const [token, curso, bloque, reto] = await cargarDatosUsuario();

	const responseLeerMetrica = await leerMetrica(token, curso, bloque, reto);
	let cant = responseLeerMetrica.data.documentationCheckCount + 1;
	const datos: any = {};
	datos['documentationCheckCount'] = cant;

	const responseEscribirMetrica = await escribirMetrica(token, curso, bloque, reto, datos);
	if (responseEscribirMetrica.data.code !== 200) {
		vscode.window.showErrorMessage('ERROR EN LA BASE DE DATOS.');
	}
}
	




export function deactivate() {}
