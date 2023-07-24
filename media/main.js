//pista1.removeAttribute('disabled');

function botonEjecutar(){
  const button = document.getElementById('btn.ejecutar');
  
  button.addEventListener('click', () => {
    vscode.postMessage({
      command: 'execute'
    });
  });
}

function botonRefrescar(){
  const button = document.getElementById('btn.actualizar');
  
  button.addEventListener('click', () => {
    vscode.postMessage({
      command: 'actualizar'
    });
  });
}


//AQUI VA TODA LA PARTE PRINCIPAL DEL PROGRAMA-----------------------------------------------------------------------------------------------------------------------------------
const vscode = acquireVsCodeApi();

botonEjecutar();
botonRefrescar();


