
(function () {
  const vscode = acquireVsCodeApi();

  const pista1 = document.getElementById('pista1');
  const pista2 = document.getElementById('pista2');
  const ejecutar = document.getElementById('btn.ejecutar');
  const actualizar = document.getElementById('btn.actualizar');
  const evaluar = document.getElementById('btn.evaluar');

  function parpadeoPista1() {
    pista1.classList.add('blinking');
    setTimeout(() => {
      pista1.classList.remove('blinking');
    }, 3000);
  }

  function parpadeoPista2() {
    pista2.classList.add('blinking');
    setTimeout(() => {
      pista2.classList.remove('blinking');
    }, 3000);
  }
  

  window.addEventListener('message', event => {
    const message = event.data;
    switch (message.type) {
      case 'libPista1':
        {
          pista1.removeAttribute('disabled');
          parpadeoPista1();
          break;
        }
      case 'libPista2':
        {
          pista2.removeAttribute('disabled');
          parpadeoPista2();
          break;
        }
      case 'bloqPista1':
        {
          pista1.disabled = true;
          break;
        }
      case 'bloqPista2':
        {
          pista2.disabled = true;
          break;
        }
      case 'libEvaluar':
      {
        evaluar.removeAttribute('disabled');
        break;
      }
      case 'bloqEvaluar':
        {
          evaluar.disabled = true;
          break;
        }
 

    }
  });

  //se ejecuta al presionar el boton evaluar
  evaluar.addEventListener('click', () => {
    vscode.postMessage({
      command: 'eval'
    });
  });

  //se ejecuta al presionar el boton PISTA 1
  pista1.addEventListener('click', () => {
    vscode.postMessage({
      command: 'ejecutarPista1'
    });
  });

   //se ejecuta al presionar el boton PISTA 2
   pista2.addEventListener('click', () => {
     vscode.postMessage({
       command: 'ejecutarPista2'
     });
   });

  //se ejecuta al presionar el boton de EJECUTAR
  ejecutar.addEventListener('click', () => {
    vscode.postMessage({
      command: 'execute'
    });
  });

//se ejecuta al presionar el botón de ACTUALIZAR
actualizar.addEventListener('click', () => {
  vscode.postMessage({
    command: 'actualizar'
  });
});







}());


