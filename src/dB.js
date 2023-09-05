const axios = require ('axios');

export function leerMetrica(token, curso, bloque, reto){
    const options = {
        headers: {
            'x-access-token': token,   
        }
    };
    const urlDB = 'http://10.113.36.13:4001/api/metrics/challenge/' + curso + '/' + bloque + '/' + reto + '/metrics';       
    return axios.get(urlDB, options);
}

export function escribirMetrica(token, curso, bloque, reto, datos){
    const options = {
        headers: {
            'x-access-token': token, 
            'Content-Type': 'application/json', 
        }        
    };
    const urlDB = 'http://10.113.36.13:4001/api/metrics/challenge/' + curso + '/' + bloque + '/' + reto + '/metrics';   
    return axios.put(urlDB, datos, options);
}



export function obtenerToken(){
    const url = 'http://localhost:2727/api/token';
    return axios.get(url);
}

export function obtenerTema(){
    const url = 'http://localhost:2727/api/challenge';
    return axios.get(url);
}

export function evualarCodigo(token, curso, bloque, reto, datos){
    const options = {
        headers: {
            'accept': 'application/json',
            'x-access-token': token, 
            'Content-Type': 'application/json',
        }        
    };
    const urlDB = 'http://10.113.36.13:4001/api/metrics/challenge/' + curso + '/' + bloque + '/' + reto + '/code';   
    return axios.post(urlDB, datos, options);
}


