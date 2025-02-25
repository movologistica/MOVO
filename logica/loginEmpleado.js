//inicio a principal empleado validacion de usario y contraseña
const CLIENT_ID = '1019271417877-fmsdkb8mfq3oi02o48k3rp2dm1mmia99.apps.googleusercontent.com';
const API_KEY = 'AIzaSyAG9ROFzBPh3FkxdYQfOmAj9dMXv0IQYUc';
const SPREADSHEET_ID = '1I1Vpm2T0bX-3R6CT_1J4sG2kmcFbel8HDBiInkgAtng';
const RANGE = 'login!A:B';

let tokenClient;

function initGIS(){
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    callback: (response) => {
      if (response.error) {
        console.error("Error de autenticación:", response.error);
        return;
      }
      // Almacenar el token en localStorage
      localStorage.setItem('authToken', response.access_token);
      // Aquí puedes llamar a tu función para obtener datos de Google Sheets
      obtenerDatosDeSheets();
    },
  });
};

function obtenerDatosDeSheets() {
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE,
  }).then(response => {
    const data = response.result.values;
    if (data) {
      const usuario = document.getElementById("cedulaEmpleado").value;
      const contraseña = document.getElementById("passwordEmpleado").value;
      const encontrado = data.find(u => u[0] === usuario && u[1] === contraseña);
      if (encontrado) {
        sessionStorage.setItem('usuarioCedula', usuario);
        window.location.href = "../paginas/principalEmpleado.html";
      } else {
        alert("Usuario o contraseña incorrectos.");
      }
    } else {
      alert("No se encontraron datos en la hoja de cálculo.");
    }
  }).catch(error => {
    console.error("Error al obtener datos:", error);
    alert("Error al conectar con Google Sheets.");
  });
}

document.getElementById("loginEmpleado").addEventListener("click", () => {
  tokenClient.requestAccessToken(); // Solicita el token de acceso
});

// Cargar la API de Google Sheets 
function loadClient() {
  gapi.load('client', () => {
    gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
    }).then(() => {
      console.log("API de Google Sheets inicializada");
    }).catch(error => {
      console.error("Error al inicializar la API:", error);
    });
  });
}

// Inicializar GIS y cargar la API
window.onload = () => {
  initGIS();
  loadClient();
};


// regresar al mine
document.getElementById("regresarAMine").addEventListener('click', function(){
    window.location.href = "../index.html";
});