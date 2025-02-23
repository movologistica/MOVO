const SPREADSHEET_ID = '1I1Vpm2T0bX-3R6CT_1J4sG2kmcFbel8HDBiInkgAtng';
const CLIENT_ID = '1019271417877-fmsdkb8mfq3oi02o48k3rp2dm1mmia99.apps.googleusercontent.com';
const API_KEY = 'AIzaSyAG9ROFzBPh3FkxdYQfOmAj9dMXv0IQYUc';

let tokenClient;
let gapiInited = false;
let gisInited = false;
let rowNumber = 0;

document.addEventListener('DOMContentLoaded', () => {
  // botones ingreso
  document.getElementById('cedulaEmpleado').addEventListener('input', buscarNombre);
  document.getElementById('obtnerHoraIngreso').addEventListener('click', obtenerHoraActualIngreso);
  document.getElementById('obtenerCoordenadasIngreso').addEventListener('click', obtenerCoordenadasIngreso);
  document.getElementById('enviarIngreso').addEventListener('click', enviarIngreso);
  // botones salida
  document.getElementById('obtenerHoraSalida').addEventListener('click', obtenerHoraActualSalida);
  document.getElementById('obtenerCoordenadasSalida').addEventListener('click', obtenerCoordenadasSalida);
  document.getElementById('enviarSalida').addEventListener('click', enviarSalida);
  //boton cerrar sesion
  document.getElementById('cerrarSesion').addEventListener('click', cerrarSesion);
  document.getElementById('regresarPrincipalEmpelado').addEventListener('click', regresarPincipalEmpleado);

  verificarEstado();
  gapiLoaded();
  gisLoaded();
});

function gapiLoaded() {
  gapi.load('client', initializeGapiClient);
}

function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    callback: (tokenResponse) => {
      console.log('Token acquired:', tokenResponse);
      localStorage.setItem('authToken', tokenResponse.access_token);
    },
  });
  gisInited = true;
}

function initializeGapiClient() {
  gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
  }).then(() => {
    gapiInited = true;
    const token = localStorage.getItem('authToken');
    if (token) {
      gapi.client.setToken({
        access_token: token
      });
    } else {
      if (gisInited) {
        tokenClient.requestAccessToken({ prompt: 'consent' });
      }
    }
  });
}

function buscarNombre() {
  const cedula = document.getElementById('cedulaEmpleado').value;
  if (cedula) {
    gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'basededatos!A:B',
    }).then(response => {
      const rows = response.result.values;
      const user = rows.find(row => row[0] === cedula);
      document.getElementById('nombreCompletoEmpleado').value = user ? user[1] : '';
      document.getElementById('fechaIngreso').value = new Date().toISOString().split('T')[0];
      document.getElementById('fechaSalida').value = new Date().toISOString().split('T')[0];
    });
  } else {
    document.getElementById('nombreCompletoEmpleado').value = '';
  }
}

function obtenerHoraActualIngreso() {
  const ahora = new Date();
  const horas = ahora.getHours().toString().padStart(2, '0');
  const minutos = ahora.getMinutes().toString().padStart(2, '0');
  document.getElementById('horaIngreso').value = `${horas}:${minutos}`;
}

function obtenerHoraActualSalida() {
  const ahora = new Date();
  const horas = ahora.getHours().toString().padStart(2, '0');
  const minutos = ahora.getMinutes().toString().padStart(2, '0');
  document.getElementById('horaSalida').value = `${horas}:${minutos}`;
}

function obtenerCoordenadasIngreso() {
  navigator.geolocation.getCurrentPosition((position) => {
    const coordenadas = `${position.coords.latitude}, ${position.coords.longitude}`;
    document.getElementById('ubicacionIngreso').value = coordenadas;
  });
}

function obtenerCoordenadasSalida() {
  navigator.geolocation.getCurrentPosition((position) => {
    const coordenadas = `${position.coords.latitude}, ${position.coords.longitude}`;
    document.getElementById('ubicacionSalida').value = coordenadas;
  });
}

function enviarIngreso() {
  const cedula = document.getElementById('cedulaEmpleado').value;
  const nombre = document.getElementById('nombreCompletoEmpleado').value;
  const fechaIngreso = document.getElementById('fechaIngreso').value;
  const horaIngreso = document.getElementById('horaIngreso').value;
  const ubicacionIngreso = document.getElementById('ubicacionIngreso').value;

  if (!cedula || !nombre || !fechaIngreso || !horaIngreso || !ubicacionIngreso) {
    alert('Por favor, complete todos los campos antes de enviar.');
    return;
  }

  const values = [
    [cedula, nombre, fechaIngreso, horaIngreso, ubicacionIngreso, '', '', '', '']
  ];

  gapi.client.sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: 'ingresos y salidas!A:I',
    valueInputOption: 'RAW',
    resource: {
      values
    }
  }).then((response) => {
    console.log(`${response.result.updates.updatedCells} celdas actualizadas.`);
    rowNumber = response.result.updates.updatedRange.match(/\d+$/)[0]; // Obtener el número de fila actualizado
    localStorage.setItem('estadoIngreso', JSON.stringify({ rowNumber }));
    bloquearCampos();
  }, (error) => {
    console.error('Error al enviar los datos:', error);
    alert('Error al enviar los datos. Por favor, intente nuevamente.');
  });
}

function enviarSalida() {
  const fechaSalida = new Date().toISOString().split('T')[0];
  const horaSalida = document.getElementById('horaSalida').value;
  const ubicacionSalida = document.getElementById('ubicacionSalida').value;

  if (!fechaSalida || !horaSalida || !ubicacionSalida) {
    alert('Por favor, complete todos los campos antes de enviar.');
    return;
  }

  gapi.client.sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `ingresos y salidas!F${rowNumber}:I${rowNumber}`,
    valueInputOption: 'RAW',
    resource: {
      values: [
        [fechaSalida, horaSalida, ubicacionSalida]
      ]
    }
  }).then((response) => {
    console.log(`${response.result.updatedCells} celdas actualizadas.`);
    localStorage.removeItem('estadoIngreso');
    desbloquearCampos();
  }, (error) => {
    console.error('Error al enviar los datos:', error);
    alert('Error al enviar los datos. Por favor, intente nuevamente.');
  });
}

function verificarEstado() {
  const estadoIngreso = JSON.parse(localStorage.getItem('estadoIngreso'));
  if (estadoIngreso) {
    rowNumber = estadoIngreso.rowNumber;
    bloquearCampos();
  }
}

function bloquearCampos() {
  document.getElementById('ingresoFieldset').disabled = true;
  document.getElementById('salidaFieldset').disabled = false;
}

function desbloquearCampos() {
  document.getElementById('formularioUrbano').reset();
  document.getElementById('ingresoFieldset').disabled = false;
  document.getElementById('salidaFieldset').disabled = true;
}

// regresar al mine
function cerrarSesion (){
  window.location.href = '../paginas/loginEmpleado.html';
};

function regresarPincipalEmpleado (){
  window.location.href = '../paginas/principalEmpleado.html';
};


//funcion para que solo se muestre ingreso, y despues se muestre salida
document.addEventListener("DOMContentLoaded", function () {
  const ingresoFieldset = document.getElementById("ingresoFieldset");
  const salidaFieldset = document.getElementById("salidaFieldset");
  const enviarIngresoBtn = document.getElementById("enviarIngreso");
  const enviarSalidaBtn = document.getElementById("enviarSalida");
  const cerrarSesionBtn = document.getElementById("cerrarSesion");

  // Verificar el estado guardado en localStorage
  if (localStorage.getItem("ingresoEnviado") === "true" && localStorage.getItem("salidaEnviada") !== "true") {
      ingresoFieldset.style.display = "none";
      salidaFieldset.style.display = "block";
  } else {
      ingresoFieldset.style.display = "block";
      salidaFieldset.style.display = "none";
  }

  // Evento para enviar ingreso y mostrar salida
  enviarIngresoBtn.addEventListener("click", function () {
      ingresoFieldset.style.display = "none";
      salidaFieldset.style.display = "block";
      localStorage.setItem("ingresoEnviado", "true"); // Guardamos el estado
  });

  // Evento para enviar salida y volver a mostrar ingreso
  enviarSalidaBtn.addEventListener("click", function () {
      salidaFieldset.style.display = "none";
      ingresoFieldset.style.display = "block";
      localStorage.setItem("salidaEnviada", "true"); // Guardamos el estado
      localStorage.removeItem("ingresoEnviado"); // Reiniciar estado
      localStorage.removeItem("salidaEnviada");
  });

  });