
function tema0(){
  const txtClase = document.getElementById('txtClase');
  const txtClase2 = document.getElementById('txtClase2');
  const tema01 = document.getElementById('tema0.1');
  const tema02 = document.getElementById('tema0.2');
  const tema03 = document.getElementById('tema0.3');
  const tema04 = document.getElementById('tema0.4');
  const tema05 = document.getElementById('tema0.5');
  const tema06 = document.getElementById('tema0.6');
  const tema07 = document.getElementById('tema0.7');
  const tema08 = document.getElementById('tema0.8');
  const tema09 = document.getElementById('tema0.9');

  txtClase2.style.display = 'none';

  txtClase.addEventListener('click', () => {
    txtClase2.style.display = 'block';
    txtClase.style.display = 'none';
    tema01.style.display = 'block';
    tema02.style.display = 'block';
    tema03.style.display = 'block';
    tema04.style.display = 'block';
    tema05.style.display = 'block';
    tema06.style.display = 'block';
    tema07.style.display = 'block';
    tema08.style.display = 'block';
    tema09.style.display = 'block';
  });

  txtClase2.addEventListener('click', () => {
    txtClase2.style.display = 'none';
    txtClase.style.display = 'block';
    tema01.style.display = 'none';
    tema02.style.display = 'none';
    tema03.style.display = 'none';
    tema04.style.display = 'none';
    tema05.style.display = 'none';
    tema06.style.display = 'none';
    tema07.style.display = 'none';
    tema08.style.display = 'none';
    tema09.style.display = 'none';
  });

  tema0Enlace(tema01, tema02, tema03, tema04, tema05, tema06, tema07, tema08, tema09);
}

function tema0Enlace(tema01, tema02, tema03, tema04, tema05, tema06, tema07, tema08, tema09){

tema01.addEventListener('click', () => {
  vscode.postMessage({
    command: 'cargarEnlace',
    url: 'https://gii.github.io/python-nb-online/00-intro.html'
  });
});

tema02.addEventListener('click', () => {
  vscode.postMessage({
    command: 'cargarEnlace',
    url: 'https://gii.github.io/python-nb-online/01-entrada-salida.html'
  });
});

tema03.addEventListener('click', () => {
  vscode.postMessage({
    command: 'cargarEnlace',
    url: 'https://gii.github.io/python-nb-online/02-condicionales.html'
  });
});

tema04.addEventListener('click', () => {
  vscode.postMessage({
    command: 'cargarEnlace',
    url: 'https://gii.github.io/python-nb-online/03-sentencias-iterativas-I.html'
  });
});

tema05.addEventListener('click', () => {
  vscode.postMessage({
    command: 'cargarEnlace',
    url: 'https://gii.github.io/python-nb-online/04-sentencias-iterativas-II.html'
  });
});

tema06.addEventListener('click', () => {
  vscode.postMessage({
    command: 'cargarEnlace',
    url: 'https://gii.github.io/python-nb-online/05-funciones-I.html'
  });
});

tema07.addEventListener('click', () => {
  vscode.postMessage({
    command: 'cargarEnlace',
    url: 'https://gii.github.io/python-nb-online/05-funciones-II.html'
  });
});

tema08.addEventListener('click', () => {
  vscode.postMessage({
    command: 'cargarEnlace',
    url: ''
  });
});

tema09.addEventListener('click', () => {
  vscode.postMessage({
    command: 'cargarEnlace',
    url: ''
  });
});


}

function temaSec(){
  const txtSec = document.getElementById('txtSec');
  const txtSec2 = document.getElementById('txtSec2');


  const txtES = document.getElementById('txtES');
  const txtCond = document.getElementById('txtCond');
  const txtBucles = document.getElementById('txtBucles');
  const txtFunc = document.getElementById('txtFunc');
  const txtListas = document.getElementById('txtListas');
  const txtFichero = document.getElementById('txtFichero');

  txtSec2.style.display = 'none';

  txtSec.addEventListener('click', () => {
    txtSec2.style.display = 'block';
    txtSec.style.display = 'none';
    txtES.style.display = 'block';
    txtCond.style.display = 'block';
    txtBucles.style.display = 'block';
    txtFunc.style.display = 'block';
    txtListas.style.display = 'block';
    txtFichero.style.display = 'block';
  });

  txtSec2.addEventListener('click', () => {
    txtSec2.style.display = 'none';
    txtSec.style.display = 'block';
    txtES.style.display = 'none';
    txtCond.style.display = 'none';
    txtBucles.style.display = 'none';
    txtFunc.style.display = 'none';
    txtListas.style.display = 'none';
    txtFichero.style.display = 'none';
  });
}

function tema1(){
    const txtES = document.getElementById('txtES');
    const txtES2 = document.getElementById('txtES2');
    const tema11 = document.getElementById('tema1.1');
    const tema12 = document.getElementById('tema1.2');
    const tema13 = document.getElementById('tema1.3');
    const tema14 = document.getElementById('tema1.4');
    const tema15 = document.getElementById('tema1.5');
  
    txtES.style.display = 'none';
  
    txtES.addEventListener('click', () => {
      txtES2.style.display = 'block';
      txtES.style.display = 'none';
      tema11.style.display = 'block';
      tema12.style.display = 'block';
      tema13.style.display = 'block';
      tema14.style.display = 'block';
      tema15.style.display = 'block';
    });
  
    txtES2.addEventListener('click', () => {
      txtES2.style.display = 'none';
      txtES.style.display = 'block';
      tema11.style.display = 'none';
      tema12.style.display = 'none';
      tema13.style.display = 'none';
      tema14.style.display = 'none';
      tema15.style.display = 'none';
    });
  
    tema1Enlace(tema11, tema12, tema13, tema14, tema15);
}
  
function tema1Enlace(tema11, tema12, tema13, tema14, tema15){

  tema11.addEventListener('click', () => {
    vscode.postMessage({
      command: 'cargarEnlace',
      url: 'https://pythones.net/sintaxis-basica-del-lenguaje/#%C2%BFQue_es_una_instruccion_en_python'
    });
  });

  tema12.addEventListener('click', () => {
    vscode.postMessage({
      command: 'cargarEnlace',
      url: 'https://pythones.net/funcion-print-y-hola-mundo/#Funcion_print_%E2%80%93_Nuestro_primer_programa'
    });
  });

  tema13.addEventListener('click', () => {
    vscode.postMessage({
      command: 'cargarEnlace',
      url: 'https://pythones.net/variables-que-son-tipos-de-variables-y-funcion-print-type/#Definicion'
    });
  });

  tema14.addEventListener('click', () => {
    vscode.postMessage({
      command: 'cargarEnlace',
      url: 'https://pythones.net/variables-que-son-tipos-de-variables-y-funcion-print-type/#Funcion_print_type_python'
    });
  });

  tema15.addEventListener('click', () => {
    vscode.postMessage({
      command: 'cargarEnlace',
      url: 'https://pythones.net/operadores-basicos-en-python/#Tipos_de_operadores_en_python'
    });
  });

  
}

function tema2(){
  const txtCond = document.getElementById('txtCond');
  const txtCond2 = document.getElementById('txtCond2');
  const tema21 = document.getElementById('tema2.1');
  const tema22 = document.getElementById('tema2.2');

  txtCond2.style.display = 'none';

  txtCond.addEventListener('click', () => {
    txtCond2.style.display = 'block';
    txtCond.style.display = 'none';
    tema21.style.display = 'block';
    tema22.style.display = 'block';
  });

  txtCond2.addEventListener('click', () => {
    txtCond2.style.display = 'none';
    txtCond.style.display = 'block';
    tema21.style.display = 'none';
    tema22.style.display = 'none';
  });

  tema2Enlace(tema21, tema22)
}

function tema2Enlace(tema21, tema22){

  tema21.addEventListener('click', () => {
    vscode.postMessage({
      command: 'cargarEnlace',
      url: 'https://pythones.net/sintaxis-basica-del-lenguaje/#El_identado_en_Python'
    });
  });

  tema22.addEventListener('click', () => {
    vscode.postMessage({
      command: 'cargarEnlace',
      url: 'https://pythones.net/if-else-elif-condicionales/#Aprendiendo_a_utilizar_condicionales_If_Elif_Else_en_python'
    });
  });

}

function tema3(){
  const txtBucles = document.getElementById('txtBucles');
  const txtBucles2 = document.getElementById('txtBucles2');
  const tema31 = document.getElementById('tema3.1');
  const tema32 = document.getElementById('tema3.2');
  const tema33 = document.getElementById('tema3.3');

  txtBucles2.style.display = 'none';

  txtBucles.addEventListener('click', () => {
    txtBucles2.style.display = 'block';
    txtBucles.style.display = 'none';
    tema31.style.display = 'block';
    tema32.style.display = 'block';
    tema33.style.display = 'block';
  });

  txtBucles2.addEventListener('click', () => {
    txtBucles2.style.display = 'none';
    txtBucles.style.display = 'block';
    tema31.style.display = 'none';
    tema32.style.display = 'none';
    tema33.style.display = 'none';
  });

  tema3Enlace(tema31, tema32, tema33)
}

function tema3Enlace(tema31, tema32, tema33){

  tema31.addEventListener('click', () => {
    vscode.postMessage({
      command: 'cargarEnlace',
      url: 'https://pythones.net/bucles-for-while-sintaxis-ejemplos/#Bucles_For'
    });
  });

  tema32.addEventListener('click', () => {
    vscode.postMessage({
      command: 'cargarEnlace',
      url: 'https://pythones.net/bucles-for-while-sintaxis-ejemplos/#Bucles_While'
    });
  });

  tema33.addEventListener('click', () => {
    vscode.postMessage({
      command: 'cargarEnlace',
      url: 'https://pythones.net/bucles-for-while-sintaxis-ejemplos/#Control_de_bucles_break_continue_y_pass_en_python'
    });
  });


}

function tema4(){
  const txtFunc = document.getElementById('txtFunc');
  const txtFunc2 = document.getElementById('txtFunc2');
  const tema41 = document.getElementById('tema4.1');
  const tema42 = document.getElementById('tema4.2');
  const tema43 = document.getElementById('tema4.3');

  txtFunc2.style.display = 'none';

  txtFunc.addEventListener('click', () => {
    txtFunc2.style.display = 'block';
    txtFunc.style.display = 'none';
    tema41.style.display = 'block';
    tema42.style.display = 'block';
    tema43.style.display = 'block';
  });

  txtFunc2.addEventListener('click', () => {
    txtFunc2.style.display = 'none';
    txtFunc.style.display = 'block';
    tema41.style.display = 'none';
    tema42.style.display = 'none';
    tema43.style.display = 'none';
  });

  tema4Enlace(tema41, tema42, tema43)
}

function tema4Enlace(tema41, tema42, tema43){

  tema41.addEventListener('click', () => {
    vscode.postMessage({
      command: 'cargarEnlace',
      url: 'https://pythones.net/que-son-las-funciones/#Funciones_en_python_3'
    });
  });

  tema42.addEventListener('click', () => {
    vscode.postMessage({
      command: 'cargarEnlace',
      url: 'https://pythones.net/funciones-predefinidas-crear-nuestra-funcion/#Funciones_predefinidas_en_python'
    });
  });

  tema43.addEventListener('click', () => {
    vscode.postMessage({
      command: 'cargarEnlace',
      url: 'https://pythones.net/funciones-predefinidas-crear-nuestra-funcion/#Como_crear_tus_propias_funciones'
    });
  });

}

function tema5(){
  const txtListas = document.getElementById('txtListas');
  const txtListas2 = document.getElementById('txtListas2');
  const tema51 = document.getElementById('tema5.1');
  const tema52 = document.getElementById('tema5.2');
  const tema53 = document.getElementById('tema5.3');
  const tema54 = document.getElementById('tema5.4');

  txtListas2.style.display = 'none';

  txtListas.addEventListener('click', () => {
    txtListas2.style.display = 'block';
    txtListas.style.display = 'none';
    tema51.style.display = 'block';
    tema52.style.display = 'block';
    tema53.style.display = 'block';
    tema54.style.display = 'block';
  });

  txtListas2.addEventListener('click', () => {
    txtListas2.style.display = 'none';
    txtListas.style.display = 'block';
    tema51.style.display = 'none';
    tema52.style.display = 'none';
    tema53.style.display = 'none';
    tema54.style.display = 'none';
  });

  tema5Enlace(tema51, tema52, tema53, tema54)
}

function tema5Enlace(tema51, tema52, tema53, tema54){

  tema51.addEventListener('click', () => {
    vscode.postMessage({
      command: 'cargarEnlace',
      url: 'https://pythones.net/listas-tuplas-python/#Listas_en_python'
    });
  });

  tema52.addEventListener('click', () => {
    vscode.postMessage({
      command: 'cargarEnlace',
      url: 'https://pythones.net/listas-tuplas-python/#Tuplas_en_python'
    });
  });

  tema53.addEventListener('click', () => {
    vscode.postMessage({
      command: 'cargarEnlace',
      url: 'https://pythones.net/listas-tuplas-python/#Accediendo_a_Listas_y_Tuplas'
    });
  });

  tema54.addEventListener('click', () => {
    vscode.postMessage({
      command: 'cargarEnlace',
      url: 'https://pythones.net/listas-tuplas-python/#Slice_cortando_Listas_y_Tuplas_en_Python'
    });
  });


}

function tema6(){
  const txtFichero = document.getElementById('txtFichero');
  const txtFichero2 = document.getElementById('txtFichero2');
  const tema61 = document.getElementById('tema6.1');
  const tema62 = document.getElementById('tema6.2');
  const tema63 = document.getElementById('tema6.3');
  const tema64 = document.getElementById('tema6.4');

  txtFichero2.style.display = 'none';

  txtFichero.addEventListener('click', () => {
    txtFichero2.style.display = 'block';
    txtFichero.style.display = 'none';
    tema61.style.display = 'block';
    tema62.style.display = 'block';
    tema63.style.display = 'block';
    tema64.style.display = 'block';
  });

  txtFichero2.addEventListener('click', () => {
    txtFichero2.style.display = 'none';
    txtFichero.style.display = 'block';
    tema61.style.display = 'none';
    tema62.style.display = 'none';
    tema63.style.display = 'none';
    tema64.style.display = 'none';
  });

  tema6Enlace(tema61, tema62, tema63, tema64)
}

function tema6Enlace(tema61, tema62, tema63, tema64){

  tema61.addEventListener('click', () => {
    vscode.postMessage({
      command: 'cargarEnlace',
      url: 'https://pythones.net/archivos-en-python-3/#Archivos_en_Python_3_Crear_leer_abrir_ejecutar'
    });
  });

  tema62.addEventListener('click', () => {
    vscode.postMessage({
      command: 'cargarEnlace',
      url: 'https://pythones.net/archivos-en-python-3/#Metodos_del_objeto_file_en_python'
    });
  });

  tema63.addEventListener('click', () => {
    vscode.postMessage({
      command: 'cargarEnlace',
      url: 'https://pythones.net/archivos-en-python-3/#Modos_de_apertura_de_archivos_en_python'
    });
  });

  tema64.addEventListener('click', () => {
    vscode.postMessage({
      command: 'cargarEnlace',
      url: 'https://pythones.net/archivos-en-python-3/#Crear_un_programa_para_leer_archivos_desde_Python'
    });
  });


}

  
  
  //AQUI VA TODA LA PARTE PRINCIPAL DEL PROGRAMA-----------------------------------------------------------------------------------------------------------------------------------
  const vscode = acquireVsCodeApi();

  temaSec();
  tema0();
  tema1();
  tema2();
  tema3();
  tema4();
  tema5();
  tema6();




  