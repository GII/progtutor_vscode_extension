import * as vscode from 'vscode';
import { PistasVS } from './classPistas';
import { ComunicacionDB } from './classBD';
import { GlobalVar } from './globalVar';


export class WorkMetric{

    //hace todo el procesamiento de los datos y revisa el texto---------------------------------------------------------------------------------------
    static async revisarTexto(intervalo: any, editor: any, diagnosticos: any, context: vscode.ExtensionContext){
        const terminal = vscode.window.activeTerminal;
        let miString: string = "";
        
        if (terminal) {
        vscode.commands.executeCommand('workbench.action.terminal.selectAll');
        vscode.commands.executeCommand('editor.action.clipboardCopyAction');
        
        const texto = await vscode.env.clipboard.readText();
        miString = texto.toString();
    
        const finalizado = this.buscarFinalTerminal(miString);
    
        if (finalizado === true) {
            clearInterval(intervalo);
    
            if (miString.search("Error") !== -1) {
                await this.tratarError(miString, editor, diagnosticos, context);
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
    private static buscarFinalTerminal(texto: string) :boolean{
        const palabra = "PS";
        let finalizado = false;
        const regex = new RegExp('\\b' + palabra + '\\b', 'gi');
        const coincidencias = texto.match(regex);
        if(coincidencias?.length === 2){
            finalizado = true;
        }
        return finalizado;
    }

    //convierte el codigo de error en uno apto para guardar en la BD----------------------------------------------------------------------
    private static guardarTipoError(codigoError: string) :string{
        codigoError = codigoError.charAt(0).toLowerCase() + codigoError.slice(1);
        codigoError = codigoError + 'Count';
        return codigoError;
    }

    public static mensajeDiagnostico(mensaje: string, linea: number, editor: any, diagnosticos: any, columna: number){
        vscode.window.showErrorMessage(`TIENE UN ERROR EN LA LÍNEA ${linea + 1}, REVISE EL CÓDIGO`);
        const range = new vscode.Range(new vscode.Position(linea, 0), new vscode.Position(linea, columna));
        const diag = new vscode.Diagnostic(range, mensaje, vscode.DiagnosticSeverity.Error);
        diagnosticos.set(editor.document.uri, [diag]);
    }

    //crea un nuevo dato del objeto para guardar en la BD el codigo de Error-------------------------------------------------------------
    private static crearDatosGuardar(resp: any, codMod: string): any{
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