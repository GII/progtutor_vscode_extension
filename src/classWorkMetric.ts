import * as vscode from 'vscode';
import { PistasVS } from './classPistas';
import { ComunicacionDB } from './classBD';
import { GlobalVar } from './globalVar';
import * as os from 'os';


export class WorkMetric{

    //hace todo el procesamiento de los datos y revisa el texto---------------------------------------------------------------------------------------
    static async revisarTexto(intervalo: any, editor: any, diagnosticos: any, context: vscode.ExtensionContext){
        const terminal = vscode.window.activeTerminal;
        let miString: string = "";
        let finalizado: boolean = false;
        let conection: boolean = false;
        
        if (terminal) {
        vscode.commands.executeCommand('workbench.action.terminal.selectAll');
        vscode.commands.executeCommand('editor.action.clipboardCopyAction');
        
        const texto = await vscode.env.clipboard.readText();
        miString = texto.toString();
    
        [finalizado, miString, conection]= this.buscarFinalTerminal(miString);
    
        if (finalizado === true) {
            clearInterval(intervalo);
            if (miString.search("Error") !== -1 || miString.search("Traceback") !== -1) {
                await this.tratarError(miString, editor, diagnosticos, context);
            } else {
                if(conection !== true){
                    this.cantEjecucion();
                    vscode.window.showInformationMessage(`¡NO HAY ERROR!`);
                    vscode.commands.executeCommand('progtutor.libEvaluar');
                }
                diagnosticos.clear();
            }
        }
        
        await vscode.env.clipboard.writeText('');
        }
    }

    //se guarda una metrica donde se tienen la cantidad de veces que se ejecutó el programa sin error-------------------------------------
    static async cantEjecucion(){
        const [token, curso, bloque, reto] = await ComunicacionDB.obtenerDatosUsuario();
        const responseLeerMetrica = await ComunicacionDB.leerMetrica(token, curso, bloque, reto);
        let cantEjecucion = responseLeerMetrica.data.data.executionCount;
        cantEjecucion = cantEjecucion + 1
        const datos: any = {};
        datos['executionCount'] = cantEjecucion;
        const responseEscribirMetrica = await ComunicacionDB.escribirMetrica(token, curso, bloque, reto, datos);
        if (responseEscribirMetrica.data.code !== 200) {
            vscode.window.showErrorMessage('ERROR EN LA BASE DE DATOS.');
        }

    }

    //tratamiento del error, guardado en base de datos-------------------------------------------------------------------------------------
    static async tratarError(miString: string, editor: any, diagnosticos: any, context: vscode.ExtensionContext) {
        try {
            let [mensajeError, ubicacionError, nombreError] = this.obtenerError(miString);
            PistasVS.mostrarPistas(ubicacionError);
            const codMod = this.guardarTipoError(nombreError);
            
            const [token, curso, bloque, reto] = await ComunicacionDB.obtenerDatosUsuario();
            PistasVS.mostrarDiagnostico(bloque, mensajeError, ubicacionError - 1, editor, diagnosticos, context);
        
            const responseLeerMetrica = await ComunicacionDB.leerMetrica(token, curso, bloque, reto);
            const datos = this.crearDatosGuardar(responseLeerMetrica.data, codMod);
        
            const responseEscribirMetrica = await ComunicacionDB.escribirMetrica(token, curso, bloque, reto, datos);
            if (responseEscribirMetrica.data.code !== 200) {
                vscode.window.showErrorMessage('ERROR EN LA BASE DE DATOS.');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`${error}`);
        }
    }

    //se obtiene el codigo del error y la explicación-------------------------------------------------------------------------------------------------
    public static obtenerError(msgError: string) :[string, number, string]{
        const resultado: string[] = msgError.split(/[ \n,]+/);	 
        const listaLineas: number[] = [];
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
                codigoError = resultado[i].slice(0, resultado[i].length - 1);
            }

            if(n2 !== -1){
                linea = parseInt(resultado[i + 1]);
                listaLineas.push(linea)
            }
        }

        for (let i = valor; i < resultado.length; i++){
            if(resultado[i] === "PS"){
                break;
            }
            error = error + " " + resultado[i] + " ";
        }

        if(msgError.search("robobopy")){
            linea = Math.min(...listaLineas);
        }

        return [error, linea, codigoError];
    }

    //se busca si el terminal ha finalizado su ejecución----------------------------------------------------------------------------------------------
    private static buscarFinalTerminal(texto: string) :[boolean, string, boolean]{
        let coincidencias: any;
        const platform = os.platform();
        let finalizado = false;
        let cantidad = 0;
        const msgConexion = "Error: Establish connection before sending a message";
        let conection = false;

        if(texto.includes(msgConexion)){
            cantidad = 2;
            vscode.window.showInformationMessage(`Revise que tenga el reto abierto o que la conexión con ROBOBO esté creada correctamente`);
            texto = "msgConexion";
            conection = true;
        }else{
            if (platform === "win32"){
                const regex = new RegExp('\\b' + "PS" + '\\b', 'gi');
                coincidencias = texto.match(regex);
                cantidad = coincidencias?.length;
    
            }else if (platform === "linux"){
                const listaPalabras = texto.trim().split(/\s+/);
    
                let contador = 0;
                for (const palabra of listaPalabras) {
                    if (palabra.includes('@') && palabra.includes(':') && palabra.includes('~')) {
                        contador++;
                    }
                }
                cantidad = contador;
                
            }else{
                const listaPalabras = texto.trim().split(/\s+/);
                const ultima = listaPalabras[listaPalabras.length - 1];
                if(ultima === '%'){
                    cantidad = 2;
                }
            }
        }

        if(cantidad === 2){
            finalizado = true;
        }
        return [finalizado, texto, conection];
    }

    //convierte el codigo de error en uno apto para guardar en la BD----------------------------------------------------------------------
    private static guardarTipoError(codigoError: string) :string{
        codigoError = codigoError.charAt(0).toLowerCase() + codigoError.slice(1);
        codigoError = codigoError + 'Count';
        return codigoError;
    }

    public static mensajeDiagnostico(mensaje: string, linea: number, editor: any, diagnosticos: any, columna: number){
        //vscode.window.showErrorMessage(`TIENE UN ERROR EN LA LÍNEA ${linea + 1}, REVISE EL CÓDIGO`);
        this.mostrarMensajeConBotones(linea)
        const range = new vscode.Range(new vscode.Position(linea, 0), new vscode.Position(linea, columna));
        const diag = new vscode.Diagnostic(range, mensaje, vscode.DiagnosticSeverity.Error);
        diagnosticos.set(editor.document.uri, [diag]);
    }

    static async mostrarMensajeConBotones(linea: number) {
        const respuesta = await vscode.window.showErrorMessage(`TIENE UN ERROR EN LA LÍNEA ${linea + 1}, REVISE EL CÓDIGO`, { modal: false }, "Ver", "Cancelar");
    
        if (respuesta === "Ver") {
            vscode.commands.executeCommand('editor.action.marker.next');
        }
    }

    //crea un nuevo dato del objeto para guardar en la BD el codigo de Error-------------------------------------------------------------
    private static crearDatosGuardar(resp: any, codMod: string): any{
        let lista_errores = ['syntaxErrorCount', 'nameErrorCount', 'typeErrorCount', 'indexErrorCount', 'indentationErrorCount',
            'valueErrorCount', 'keyErrorCount', 'importErrorCount', 'fileNotFoundErrorCount', 'attributeErrorCount'];
        
        if(!lista_errores.includes(codMod)){
            codMod = 'otherErrorCount';
        }

        let error = resp.data.errorCount + 1;
        const datos: any = {};
        datos['errorCount'] = error;
        let errorCodigo = resp.data[codMod] + 1;
        datos[codMod] = errorCodigo;
        return datos;
    }

    //captura el tiempo de inactividad en pantalla y todas las métricas de tiempo---------------------------------------------------------
    public static tiempoInactividad(){
        vscode.commands.executeCommand('progtutor.bloqEvaluar');
        const tiempo = new Date();
        if(GlobalVar.tiempoInicial === 0){
            GlobalVar.tiempoInicial = (tiempo.getHours() * 3600) + (tiempo.getMinutes() * 60) + tiempo.getSeconds();
        }

        const tiempoFinal = (tiempo.getHours() * 3600) + (tiempo.getMinutes() * 60) + tiempo.getSeconds();
        const tiempoTrans = tiempoFinal - GlobalVar.tiempoInicial;

        if(tiempoTrans > GlobalVar.umbralTiempoInact){
            this.tratarTiempos(tiempoTrans);
            GlobalVar.tiempoInicial = tiempoFinal;
        }
    }

    //tratamiento de los tiempos y guardado en la base de datos---------------------------------------------------------------------------
    static async tratarTiempos(tiempoTrans: number){
        try{
            const [token, curso, bloque, reto] = await ComunicacionDB.obtenerDatosUsuario();
            const responseLeerMetrica = await ComunicacionDB.leerMetrica(token, curso, bloque, reto);
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
            const responseEscribirMetrica = await ComunicacionDB.escribirMetrica(token, curso, bloque, reto, datos);
            if (responseEscribirMetrica.data.code !== 200){
                vscode.window.showErrorMessage('ERROR EN LA BASE DE DATOS.');
            }
        }catch(error){
            vscode.window.showErrorMessage('ERROR EN LA BASE DE DATOS.');
        }
    }

    //se actualiza la metrica cada vez que el profesor resuelve una duda-------------------------------------------------------------------
    public static async aumentarMetrica(metrica: string){
        const [token, curso, bloque, reto] = await ComunicacionDB.obtenerDatosUsuario();
        const responseLeerMetrica = await ComunicacionDB.leerMetrica(token, curso, bloque, reto);
        const datos: any = {};
        //datos['solvedDoubtCount'] = responseLeerMetrica.data.data.solvedDoubtCount + 1;
        datos[metrica] = responseLeerMetrica.data.data[metrica] + 1;

        const responseEscribirMetrica = await ComunicacionDB.escribirMetrica(token, curso, bloque, reto, datos);
        if (responseEscribirMetrica.data.code !== 200) {
            vscode.window.showErrorMessage('ERROR EN LA BASE DE DATOS.');
        }
    }

}