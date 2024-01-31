const axios = require ('axios');
import * as vscode from 'vscode';

export class ComunicacionDB{
    static dirLOCAL = "http://localhost:2727/api/"

    static publicDomain = "progtutor.citic.udc.es"

    static getAPIUrl(){
        var loc = window.location;
        var host = loc.host.split(':')[0];
        if (host != this.publicDomain) host += ":4001"
        return loc.protocol + "//" + host + "/api/";
    }

    static leerMetrica(token, curso, bloque, reto){
        const options = {
            headers: {
                'x-access-token': token,   
            }
        };
        const urlDB = `${ComunicacionDB.getAPIUrl()}metrics/challenge/${curso}/${bloque}/${reto}/metrics`;    
        return axios.get(urlDB, options);
    }
    
    
    static escribirMetrica(token, curso, bloque, reto, datos){
        const options = {
            headers: {
                'x-access-token': token, 
                'Content-Type': 'application/json', 
            }        
        };
        const urlDB = `${ComunicacionDB.getAPIUrl()}metrics/challenge/${curso}/${bloque}/${reto}/metrics`; 
        return axios.put(urlDB, datos, options);
    }

    static obtenerToken(){
        const url = `${ComunicacionDB.dirLOCAL}token`;
        return axios.get(url);
    }
    
    static obtenerTema(){
        const url = `${ComunicacionDB.dirLOCAL}challenge`;
        return axios.get(url);
    }

    static mandarEvaluar(){
        const url = `${ComunicacionDB.dirLOCAL}evaluation`;
        return axios.get(url);
    }
    
    static escribirCodigo(token, curso, bloque, reto, datos){
        const options = {
            headers: {
                'accept': 'application/json',
                'x-access-token': token, 
                'Content-Type': 'application/json',
            }        
        };
        const urlDB = `${ComunicacionDB.getAPIUrl()}metrics/challenge/${curso}/${bloque}/${reto}/code`; 
        return axios.post(urlDB, datos, options);
    }

    //se cargan los datos de token, curso y reto----------------------------------------------------------------------------------------------------
    static async obtenerDatosUsuario() {
        try {
        const responseToken = await this.obtenerToken();
        
        if (responseToken.data.code !== 200) {
            vscode.window.showErrorMessage('Debe abrir primero el simulador y cargar un reto');
        }
        
        const token = responseToken.data.data.userAuthToken;
        const responseTema = await this.obtenerTema();
        const curso = responseTema.data.data.challenge.CourseId;
        const bloque = responseTema.data.data.challenge.BlockId;
        const reto = responseTema.data.data.challenge.ChallengeId;
        
        return [token, curso, bloque, reto];
        } catch (error) {
            vscode.window.showErrorMessage('Debe abrir primero el simulador y cargar un reto');
            return ['', '', '', ''];
        }
    }

}




