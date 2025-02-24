const SPREADSHEET_ID = '1I1Vpm2T0bX-3R6CT_1J4sG2kmcFbel8HDBiInkgAtng';
const CLIENT_ID = '1019271417877-fmsdkb8mfq3oi02o48k3rp2dm1mmia99.apps.googleusercontent.com';
const API_KEY = 'AIzaSyAG9ROFzBPh3FkxdYQfOmAj9dMXv0IQYUc';

let gapiInited = false;
let gisInited = false;
let tokenClient;

  //BUSCAR NOMBRE EN BASE DE DATOS
  function buscarNombre() {
    const cedula = document.getElementById('cedulaCond').value;
    if (cedula) {
      gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'basededatos!A:B',
      }).then(response => {
        const rows = response.result.values;
        const user = rows.find(row => row[0] === cedula);
        document.getElementById('nombreCompletoCond').value = user ? user[1] : '';
      }).catch(error => {
        console.error('Error al obtener los datos de la hoja de cálculo:', error);
      });
    } else {
      document.getElementById('nombreCompletoCond').value = '';
    }
  }

  //INICIALIZAR API DE GOOGLE
  function gapiLoaded() {
    console.log('GAPI loaded');
    gapi.load('client', initializeGapiClient);
  }
  
  function gisLoaded() {
    console.log('GIS loaded');
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
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
    }).catch(error => {
      console.error('Error al inicializar el cliente de GAPI:', error);
    });
  }

  function setFechaActual() {
    const hoy = new Date();
    const dia = hoy.getDate().toString().padStart(2, '0');
    const mes = (hoy.getMonth() + 1).toString().padStart(2, '0'); // Los meses empiezan desde 0
    const año = hoy.getFullYear();
    document.getElementById('icioLabores').value = `${año}-${mes}-${dia}`;
  }

  function horaActialIniioLabores() {
    const ahora = new Date();
    const horas = ahora.getHours().toString().padStart(2, '0');
    const minutos = ahora.getMinutes().toString().padStart(2, '0');
    document.getElementById('horaIniciolabores').value = `${horas}:${minutos}`;
  }
  
  //funcionalidad de botones
  document.getElementById('obtnerHoraIngreso').addEventListener('click', horaActialIniioLabores);
  document.getElementById('btninicioLabores').addEventListener('click', setFechaActual);
  document.getElementById('cedulaCond').addEventListener('change', buscarNombre);

  // modal reportar inicio de labores
document.addEventListener('DOMContentLoaded', (event) => {
    const btnInicioLabores = document.getElementById('btninicioLabores');
    const modalInicioLabores = document.getElementById('modalInicioLabores');
    const closeModal = modalInicioLabores.querySelector('.close');
  
    btnInicioLabores.addEventListener('click', () => {
      modalInicioLabores.style.display = 'block';
    });
  
    closeModal.addEventListener('click', () => {
      modalInicioLabores.style.display = 'none';
    });
  
    window.addEventListener('click', (event) => {
      if (event.target == modalInicioLabores) {
        modalInicioLabores.style.display = 'none';
      }
    });
  });