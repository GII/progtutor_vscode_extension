
(function () {
    const vscode = acquireVsCodeApi();
  
    const prof = document.getElementById('btn.profesor');

    //se ejecuta al presionar el boton del profesor
    prof.addEventListener('click', () => {
      vscode.postMessage({
        command: 'dudas'
      });
    });
  
 
  
  }());