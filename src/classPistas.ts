import * as vscode from 'vscode';
import * as fs from 'fs';
import { GlobalVar } from './globalVar';
import { WorkMetric } from './classWorkMetric';
import { ComunicacionDB } from './classBD';

export class PistasVS {
    //muestra el mensaje creado por chat gpt-----------------------------------------------------------------------------------------------
    private static async leerExplicGPT(mensaje: string, context: vscode.ExtensionContext) :Promise<string>{
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
    public static mostrarPistas(linea: number){
        if(GlobalVar.lineaError === 0){
            GlobalVar.lineaError = linea;
        }else{
            if(GlobalVar.lineaError === linea){
                if(GlobalVar.modCodigo === true && GlobalVar.permisoLibPista1 === true && GlobalVar.permisoLibPista2 === true){
                    GlobalVar.contErrorConsec1 = GlobalVar.contErrorConsec1 + 1;
                    GlobalVar.contErrorConsec2 = GlobalVar.contErrorConsec2 + 1;
                    GlobalVar.modCodigo = false;
                }
                if(GlobalVar.modCodigo === true && GlobalVar.permisoLibPista2 === true){
                    GlobalVar.contErrorConsec2 = GlobalVar.contErrorConsec2 + 1;
                    GlobalVar.modCodigo = false;
                }
                
                if(GlobalVar.contErrorConsec1 > GlobalVar.umbralCantError){
                    vscode.commands.executeCommand('progtutor.libPista1');
                    vscode.commands.executeCommand('progtutor.libPista2');
                    vscode.window.showInformationMessage(`Veo que no encuentras la solución, tienes libre una pista para usar`);
                }
                if(GlobalVar.contErrorConsec2 > GlobalVar.umbralCantError){
                    vscode.commands.executeCommand('progtutor.libPista2');
                    vscode.window.showInformationMessage(`Veo que no encuentras la solución, tienes libre una pista para usar`);
                }
            }else{
                GlobalVar.lineaError = linea;
                GlobalVar.contErrorConsec1 = 0;
                GlobalVar.contErrorConsec2 = 0;
                GlobalVar.modCodigo = false;
                vscode.commands.executeCommand('progtutor.bloqPista1');
                vscode.commands.executeCommand('progtutor.bloqPista2');
            } 
        }
    }

    //obtiene el mensaje de la pista y la ubicación---------------------------------------------------------------------------------------
    private static async mensajePista() :Promise<[string, number, number, any]> {
        const terminal = vscode.window.activeTerminal;
        let miString: string = "";
        
        if (terminal) {
        vscode.commands.executeCommand('workbench.action.terminal.selectAll');
        vscode.commands.executeCommand('editor.action.clipboardCopyAction');
        
        const texto = await vscode.env.clipboard.readText();
        miString = texto.toString();
        await vscode.env.clipboard.writeText('');
        }

        const [mensajeError, ubicacionError, nombreError] = WorkMetric.obtenerError(miString);
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
    public static async ejecutarPista1(diagnosticos: any){
        const [mensajeError, ubicacionError, columna, editor] = await this.mensajePista();
        WorkMetric.mensajeDiagnostico(mensajeError, ubicacionError-1, editor, diagnosticos, columna);
    }

    //ejecuta la pista 2 mostrando el mensaje ampliado-------------------------------------------------------------------------------------
    public static async ejecutarPista2(diagnosticos: any, context: vscode.ExtensionContext){
        const [mensajeError, ubicacionError, columna, editor] = await this.mensajePista();
        const mensajeGPT = await this.leerExplicGPT(mensajeError, context);
        WorkMetric.mensajeDiagnostico(mensajeGPT, ubicacionError-1, editor, diagnosticos, columna);
    }

    //se crea una ventana de diagnostico con el mensaje a mostrar-------------------------------------------------------------------------------------
    public static async mostrarDiagnostico(bloque: string, mensaje: string, linea: number, editor: any, diagnosticos: any, context: vscode.ExtensionContext){
        const lineaCodigo = editor.document.lineAt(linea);
        const texto = lineaCodigo.text;
        let columna = texto.length + 1;
        const bloqueId = parseInt(bloque, 10);
        if(bloqueId <= GlobalVar.umbralPistaGPT){
            const mensajeGPT = await this.leerExplicGPT(mensaje, context);
            WorkMetric.mensajeDiagnostico(mensajeGPT, linea, editor, diagnosticos, columna);
        }else if(bloqueId > GlobalVar.umbralPistaGPT && bloqueId <= GlobalVar.umbralPistaLinea){
            GlobalVar.permisoLibPista2 = true;
            WorkMetric.mensajeDiagnostico(mensaje, linea, editor, diagnosticos, columna);
        }else{
            GlobalVar.permisoLibPista1 = true;
            GlobalVar.permisoLibPista2 = true;
            diagnosticos.clear();
        }	
    }

    public static async evaluarCodigo() {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const dato: any = {};
            const textoGuardado = editor.document.getText().replace(/\n/g, '\n');
            dato['submittedCode'] = textoGuardado;
            const [token, curso, bloque, reto] = await ComunicacionDB.obtenerDatosUsuario();
            const responseEscribirMetrica = await ComunicacionDB.escribirCodigo(token, curso, bloque, reto, dato);
            //vscode.window.showErrorMessage('Se guardó el código en base de datos');
            if (responseEscribirMetrica.data.code !== 200) {
                vscode.window.showErrorMessage('ERROR EN LA BASE DE DATOS.');
            }
            if (responseEscribirMetrica.data.code === 200) {
                //vscode.window.showErrorMessage('Se manda a evaluar');
                const respondeEvaluacion = await ComunicacionDB.mandarEvaluar();
                //vscode.window.showErrorMessage('Se obtiene una respuesta de la evaluación');
                if(respondeEvaluacion.data.code === 200){
                    vscode.window.showInformationMessage('EVALUACIÓN EN CURSO, REVISE EL SIMULADOR PARA MÁS DETALLES.');
                }else{
                    vscode.window.showErrorMessage('ERROR, Debe estar en la página inicial para realizar la evaluación');
                }

            }
    
            }else {
            vscode.window.showErrorMessage('No hay un editor activo.');
        }
      }

}

