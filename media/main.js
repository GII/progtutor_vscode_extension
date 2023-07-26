
(function () {
  const vscode = acquireVsCodeApi();

  window.addEventListener('message', event => {
    const message = event.data;
    switch (message.type) {
      case 'libPista1':
        {
          const pista1 = document.getElementById('pista1');
          pista1.removeAttribute('disabled');
          break;
        }
      case 'libPista2':
        {
          const pista2 = document.getElementById('pista2');
          pista2.removeAttribute('disabled');
          break;
        }
      case 'bloqPista1':
        {
          const pista1 = document.getElementById('pista1');
          pista1.disabled = true;
          break;
        }
      case 'bloqPista2':
        {
          const pista2 = document.getElementById('pista2');
          pista2.disabled = true;
          break;
        }

    }
  });



  //se ejecuta al presionar el boton de EJECUTAR
  const ejecutar = document.getElementById('btn.ejecutar');
  ejecutar.addEventListener('click', () => {
      vscode.postMessage({
        command: 'execute'
      });
    });
  
  //se ejecuta al presionar el botón de ACTUALIZAR
  const actualizar = document.getElementById('btn.actualizar');
  actualizar.addEventListener('click', () => {
    vscode.postMessage({
      command: 'actualizar'
    });
  });

  //se ejecuta al presionar el boton PISTA 1
  const pista11 = document.getElementById('pista1');
  pista11.addEventListener('click', () => {
    vscode.postMessage({
      command: 'pistauno'
    });
  });

   //se ejecuta al presionar el boton PISTA 2
   const pista22 = document.getElementById('pista2');
   pista22.addEventListener('click', () => {
     vscode.postMessage({
       command: 'pistados'
     });
   });





}());


