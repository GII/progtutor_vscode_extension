
import * as vscode from 'vscode';
import * as moment from 'moment';
import {escribirMetrica} from './dB';
import {leerMetrica} from './dB';
import {obtenerToken} from './dB';
import {obtenerTema} from './dB';
import {WebPrincipal} from './webPrinc';
import {WebBibliografia} from './webBiblig';
import {WebBibliog} from './bib/bibliog';
import {getWebviewOptions} from './bib/bibliog';


let tiempoInicial: number = 0;
let token = '';
let curso = '';
let bloque = '';
let reto = '';


export function activate(this: any, context: vscode.ExtensionContext) {

	//crea el webview donde se muestran los botones---------------------------------------------------------------------------------
	const webPrinc = new WebPrincipal(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(WebPrincipal.viewType, webPrinc));

	const webBib = new WebBibliografia(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(WebBibliografia.viewType, webBib));

	//evento que se activa cada vez que se modifica el fichero python.py-----------------------------------------------------------
	context.subscriptions.push(vscode.workspace.onDidChangeTextDocument((event) => {		
        if (event.document === vscode.window.activeTextEditor?.document) {
            tiempoInactividad();
        }
    }));

	//comando para ejecutar el archivo python--------------------------------------------------------------------------------------
	const diagnosticos = vscode.languages.createDiagnosticCollection('python');
	diagnosticos.clear();
	context.subscriptions.push(
		vscode.commands.registerCommand('progtutor.ejecutarArchivo', () => {
			ejecutar(diagnosticos);
	}));

	//comando para abrir una página web en VsCode--------------------------------------------------------------------------------
	context.subscriptions.push(
		vscode.commands.registerCommand('progtutor.abrirWeb', () => {
			WebBibliog.createOrShow(context.extensionUri);
		}));

	if (vscode.window.registerWebviewPanelSerializer) {
		vscode.window.registerWebviewPanelSerializer(WebBibliog.viewType, {
			async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
				console.log(`Got state: ${state}`);
				webviewPanel.webview.options = getWebviewOptions(context.extensionUri);
				WebBibliog.revive(webviewPanel, context.extensionUri);
			}
		});
	}

	//comando para pedirle a UNITY los datos del usuario-----------------------------------------------------------------------------
	context.subscriptions.push(
		vscode.commands.registerCommand('progtutor.comUnity', () => {
			cargarDatosUsuario();
	}));

	//comando para refescar la página principal---------------------------------------------------------------------------------------
	context.subscriptions.push(
		vscode.commands.registerCommand('progtutor.refrecar', () => {
			cargarDatosUsuario();
	}));

	


	  //ejecutarArchivo(diagnosticos)
	  //vscode.window.showInformationMessage(`${pythonFilePath}`);
}





//se cargan los datos de token, curso y reto----------------------------------------------------------------------------------------------------
function cargarDatosUsuario(){
	obtenerToken()
	.then((response: { data: any; }) => {
		if(response.data.code === 200){
			token = response.data.data.userAuthToken;
			obtenerTema()
			.then((response: { data: any; }) => {
				curso = response.data.data.challenge.CourseId;
				bloque = response.data.data.challenge.BlockId;
				reto = response.data.data.challenge.ChallengeId;
				vscode.window.showInformationMessage(`Datos de Usuario cargados correctamente`);
			})
			.catch((error: any) => {
				vscode.window.showInformationMessage(`Antes de ejecutar debe cargar un reto`);
			});
			}
    })
	.catch((error: any) => {
		vscode.window.showInformationMessage(`Primero debe abrir el simulador y loguearse`);
	});
}

//se cargan los datos del reto y se ejecuta el archivo------------------------------------------------------------------------------------------
function ejecutar(diagnosticos: any){
	if(reto === ''){
		vscode.window.showInformationMessage(`Debe actualizar la página`);
	}
	else{
		obtenerTema()
		.then((response: { data: any; }) => {
			curso = response.data.data.challenge.CourseId;
			bloque = response.data.data.challenge.BlockId;
			reto = response.data.data.challenge.ChallengeId;
			ejecutarArchivo(diagnosticos);
		})
		.catch((error: any) => {
			vscode.window.showInformationMessage(`Antes de ejecutar debe cargar un reto`);
		});
	}
}


//se ejecuta el archivo python en un terminal nuevo y se hace todo el proceso para capturar el error---------------------------------------------
function ejecutarArchivo(diagnosticos: any){
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
		revisarTexto(intervalo, editor, diagnosticos);
	  }, 2000);

}

//hace todo el procesamiento de los datos y revisa el texto---------------------------------------------------------------------------------------
function revisarTexto(intervalo: any, editor: any, diagnosticos: any) {
	const terminal = vscode.window.activeTerminal;
	let miString: string = "";
	let resultado = false;
	
	if (terminal) {
		 vscode.commands.executeCommand('workbench.action.terminal.selectAll');
		 vscode.commands.executeCommand('editor.action.clipboardCopyAction');
		 vscode.env.clipboard.readText().then((texto) => {
			miString = texto.toString();
			const finalizado = buscarFinalTerminal(miString);
			if(finalizado === true){
				clearInterval(intervalo);
				if(miString.search("Error") !== -1){
					tratarError(miString, editor, diagnosticos);
				}else{
					vscode.window.showInformationMessage(`¡NO HAY ERROR!`);
				}
			}
		  });
		 vscode.env.clipboard.writeText('');
	}
}

//se busca si el terminal ha finalizado su ejecución----------------------------------------------------------------------------------------------
function buscarFinalTerminal(texto: string) :boolean{
	const palabra = "PS";
	let finalizado = false;
	const regex = new RegExp('\\b' + palabra + '\\b', 'gi');
	const coincidencias = texto.match(regex);
	if(coincidencias?.length === 3){
		finalizado = true;
	}
	return finalizado;
}

//se obtiene el codigo del error y la explicación-------------------------------------------------------------------------------------------------
function obtenerError(msgError: string) :[string, number, any, string]{
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

	const fechaHora = moment().format('YYYY-MM-DD HH:mm:ss');
	return [error, linea, fechaHora, codigoError];
}

//se crea una ventana de diagnostico con el mensaje a mostrar-------------------------------------------------------------------------------------
function mostrarDiagnostico(mensaje: string, linea: number, editor: any, diagnosticos: any){
	const lineaCodigo = editor.document.lineAt(linea);
    const texto = lineaCodigo.text;
	let columna = texto.length + 1;

	const range = new vscode.Range(new vscode.Position(linea, 0), new vscode.Position(linea, columna));
	const diag = new vscode.Diagnostic(range, mensaje, vscode.DiagnosticSeverity.Error);
	diagnosticos.set(editor.document.uri, [diag]);
}

//tratamiento del error, guardado en base de datos-------------------------------------------------------------------------------------
function tratarError(miString: string, editor: any, diagnosticos: any){
	const [mensaje, linea, fechaHora, codigoError] = obtenerError(miString);
	mostrarDiagnostico(mensaje, linea - 1, editor, diagnosticos);
	vscode.window.showErrorMessage(`TIENE UN ERROR EN LA LÍNEA ${linea}, REVISE EL CÓDIGO`);
	const codMod = guardarTipoError(codigoError);
	leerMetrica(token, curso, bloque, reto)
	.then((response: { data: any; }) => {
		let datos = crearDatosGuardar(response.data, codMod);
		escribirMetrica(token, curso, bloque, reto, datos)
		.then((response: { data: any; }) => {
		if (response.data.code !== 200){
			vscode.window.showErrorMessage('ERROR EN LA BASE DE DATOS.');
		}
		});
	});
}

//captura el tiempo de inactividad en pantalla y todas las métricas de tiempo---------------------------------------------------------
function tiempoInactividad(){
	const tiempo = new Date();
	if(tiempoInicial === 0){
		tiempoInicial = (tiempo.getHours() * 3600) + (tiempo.getMinutes() * 60) + tiempo.getSeconds();
	}

	const tiempoFinal = (tiempo.getHours() * 3600) + (tiempo.getMinutes() * 60) + tiempo.getSeconds();
	const tiempoTrans = tiempoFinal - tiempoInicial;

	if(tiempoTrans > 300){
		tratarTiempos(tiempoTrans);
		tiempoInicial = tiempoFinal;
	}
}

//tratamiento de los tiempos y guardado en la base de datos---------------------------------------------------------------------------
function tratarTiempos(tiempoTrans: number){
	leerMetrica(token, curso, bloque, reto)
	.then((response: { data: any; }) => {
		let cantPausas = response.data.data.pauseCount + 1;
		let tiempoTotal = response.data.data.totalTime + tiempoTrans;
		let tiempoMin = response.data.data.minTime;
		if(tiempoMin === 0){
			tiempoMin = tiempoTrans;
		}else{
			if(tiempoMin > tiempoTrans){
				tiempoMin = tiempoTrans;
			}
		}
		let tiempoMax = response.data.data.maxTime;
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
		escribirMetrica(token, curso, bloque, reto, datos)
		.then((response: { data: any; }) => {
		if (response.data.code !== 200){
			vscode.window.showErrorMessage('ERROR EN LA BASE DE DATOS.');
		}
		});
	});
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


//aqui poner las funciones de prueba------------------------------------------------------------------------------------------
function checkThemeStyle() {
    // Obtenemos la configuración actual
    const config = vscode.workspace.getConfiguration();

    // Obtenemos el nombre del tema actual
    const currentTheme = config.get<string>('workbench.colorTheme');
	//vscode.window.showInformationMessage(`${currentTheme}`);
    // Verificamos si el tema contiene la palabra "dark" o "light"
    if (currentTheme && currentTheme.includes('Dark')) {
        vscode.window.showInformationMessage(`OSCURO`);
    } else {
        vscode.window.showInformationMessage(`CLARO`);
    }
}



export function deactivate() {}
