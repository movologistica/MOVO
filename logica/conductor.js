import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const SPREADSHEET_ID = '1I1Vpm2T0bX-3R6CT_1J4sG2kmcFbel8HDBiInkgAtng';
const CLIENT_ID = '1019271417877-fmsdkb8mfq3oi02o48k3rp2dm1mmia99.apps.googleusercontent.com';
const API_KEY = 'AIzaSyAG9ROFzBPh3FkxdYQfOmAj9dMXv0IQYUc';

let tokenClient;
let gapiInited = false;
let gisInited = false;
let rowNumber = 0;


// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD2HXL-xapM7d8M1UMQSj5NTr0VBl_E0Ls",
    authDomain: "base-de-datos-451315.firebaseapp.com",
    projectId: "base-de-datos-451315",
    storageBucket: "base-de-datos-451315.appspot.com",
    messagingSenderId: "1019271417877",
    appId: "1:1019271417877:web:c5ace1c4fc935498913e1c",
    measurementId: "G-E88H32KFFT"
  };
  
  // Inicializar Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
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

// Función para obtener datos del conductor desde Firestore
async function cargarDatosConductor() {
    const cedulaActual = sessionStorage.getItem("usuarioCedula");

    if (!cedulaActual) {
        alert("Error: No se encontró la cédula del usuario.");
        return;
    }

    try {
        const userRef = doc(db, "usuarios_login", cedulaActual);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            alert("Error: No se encontró el usuario en Firestore.");
            return;
        }

        const userData = userDoc.data();
        document.getElementById("cedulaCond").value = cedulaActual;
        document.getElementById("nombreCompletoCond").value = userData.nombre || "Sin Nombre";

    } catch (error) {
        console.error("Error al obtener datos del conductor:", error);
        alert("Error al conectar con Firebase.");
    }
}

//funcion para cargar datos de usuario 
document.addEventListener("DOMContentLoaded", () => {
  cargarDatosConductor();
  gapiLoaded();
  gisLoaded();
});
