//pista1.removeAttribute('disabled');

function tema1(){
  const txtIntrod = document.getElementById('txtIntrod');
  const txtIntrod2 = document.getElementById('txtIntrod2');
  const tema11 = document.getElementById('tema1.1');
  const tema12 = document.getElementById('tema1.2');
  const tema13 = document.getElementById('tema1.3');
  const tema14 = document.getElementById('tema1.4');
  const tema15 = document.getElementById('tema1.5');
  const tema16 = document.getElementById('tema1.6');

  txtIntrod2.style.display = 'none';

  txtIntrod.addEventListener('click', () => {
    txtIntrod2.style.display = 'block';
    txtIntrod.style.display = 'none';
    tema11.style.display = 'block';
    tema12.style.display = 'block';
    tema13.style.display = 'block';
    tema14.style.display = 'block';
    tema15.style.display = 'block';
    tema16.style.display = 'block';
  });

  txtIntrod2.addEventListener('click', () => {
    txtIntrod2.style.display = 'none';
    txtIntrod.style.display = 'block';
    tema11.style.display = 'none';
    tema12.style.display = 'none';
    tema13.style.display = 'none';
    tema14.style.display = 'none';
    tema15.style.display = 'none';
    tema16.style.display = 'none';
  });

  tema1Enlace(tema11, tema12, tema13, tema14, tema15, tema16);
}

function tema1Enlace(tema11, tema12, tema13, tema14, tema15, tema16){
  
  tema11.addEventListener('click', () => {
    vscode.postMessage({
      command: 'cargarTema11'
    });
  });
}

function tema2(){
  const txtFujo = document.getElementById('txtFujo');
  const txtFujo2 = document.getElementById('txtFujo2');
  const tema21 = document.getElementById('tema2.1');
  const tema22 = document.getElementById('tema2.2');
  const tema23 = document.getElementById('tema2.3');

  txtFujo2.style.display = 'none';

  txtFujo.addEventListener('click', () => {
    txtFujo2.style.display = 'block';
    txtFujo.style.display = 'none';
    tema21.style.display = 'block';
    tema22.style.display = 'block';
    tema23.style.display = 'block';
  });

  txtFujo2.addEventListener('click', () => {
    txtFujo2.style.display = 'none';
    txtFujo.style.display = 'block';
    tema21.style.display = 'none';
    tema22.style.display = 'none';
    tema23.style.display = 'none';
  });
}

function tema3(){
  const txtFunc = document.getElementById('txtFunc');
  const txtFunc2 = document.getElementById('txtFunc2');
  const tema31 = document.getElementById('tema3.1');
  const tema32 = document.getElementById('tema3.2');
  const tema33 = document.getElementById('tema3.3');
  const tema34 = document.getElementById('tema3.4');
  const tema35 = document.getElementById('tema3.5');
  const tema36 = document.getElementById('tema3.6');
  const tema37 = document.getElementById('tema3.7');

  txtFunc2.style.display = 'none';

  txtFunc.addEventListener('click', () => {
    txtFunc2.style.display = 'block';
    txtFunc.style.display = 'none';
    tema31.style.display = 'block';
    tema32.style.display = 'block';
    tema33.style.display = 'block';
    tema34.style.display = 'block';
    tema35.style.display = 'block';
    tema36.style.display = 'block';
    tema36.style.display = 'block';
  });

  txtFunc2.addEventListener('click', () => {
    txtFunc2.style.display = 'none';
    txtFunc.style.display = 'block';
    tema31.style.display = 'none';
    tema32.style.display = 'none';
    tema33.style.display = 'none';
    tema34.style.display = 'none';
    tema35.style.display = 'none';
    tema36.style.display = 'none';
    tema36.style.display = 'none';
  });
}

function tema4(){
  const txtDatos = document.getElementById('txtDatos');
  const txtDatos2 = document.getElementById('txtDatos2');
  const tema41 = document.getElementById('tema4.1');
  const tema42 = document.getElementById('tema4.2');
  const tema43 = document.getElementById('tema4.3');
  const tema44 = document.getElementById('tema4.4');

  txtDatos2.style.display = 'none';

  txtDatos.addEventListener('click', () => {
    txtDatos2.style.display = 'block';
    txtDatos.style.display = 'none';
    tema41.style.display = 'block';
    tema42.style.display = 'block';
    tema43.style.display = 'block';
    tema44.style.display = 'block';
  });

  txtDatos2.addEventListener('click', () => {
    txtDatos2.style.display = 'none';
    txtDatos.style.display = 'block';
    tema41.style.display = 'none';
    tema42.style.display = 'none';
    tema43.style.display = 'none';
    tema44.style.display = 'none';
  });
}

function tema5(){
  const txtFichero = document.getElementById('txtFichero');
  const txtFichero2 = document.getElementById('txtFichero2');
  const tema51 = document.getElementById('tema5.1');
  const tema52 = document.getElementById('tema5.2');

  txtFichero2.style.display = 'none';

  txtFichero.addEventListener('click', () => {
    txtFichero2.style.display = 'block';
    txtFichero.style.display = 'none';
    tema51.style.display = 'block';
    tema52.style.display = 'block';
  });

  txtFichero2.addEventListener('click', () => {
    txtFichero2.style.display = 'none';
    txtFichero.style.display = 'block';
    tema51.style.display = 'none';
    tema52.style.display = 'none';
  });
}



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

//evento de los botones al ejecutar la bibliografia
tema1();
tema2();
tema3();
tema4();
tema5();

