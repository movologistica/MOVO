import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

document.addEventListener('DOMContentLoaded', () => {
  cargarDatosConductor();
  
  // Ocultar los campos de salida al cargar la página
  document.getElementById('salidaFieldset').style.display = 'none';

  // Botones ingreso
  document.getElementById('obtnerHoraIngreso').addEventListener('click', obtenerHoraActualIngreso);
  document.getElementById('obtenerCoordenadasIngreso').addEventListener('click', obtenerCoordenadasIngreso);
  document.getElementById('enviarIngreso').addEventListener('click', enviarIngreso);
  // Botones salida
  document.getElementById('obtenerHoraSalida').addEventListener('click', obtenerHoraActualSalida);
  document.getElementById('obtenerCoordenadasSalida').addEventListener('click', obtenerCoordenadasSalida);
  document.getElementById('enviarSalida').addEventListener('click', enviarSalida);
  // Botón cerrar sesión
  document.getElementById('cerrarSesion').addEventListener('click', cerrarSesion);
  document.getElementById('regresarPrincipalEmpelado').addEventListener('click', regresarPincipalEmpleado);
});

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
    document.getElementById("cedulaEmpleado").value = cedulaActual;
    document.getElementById("nombreCompletoEmpleado").value = userData.nombre || "Sin Nombre";

    // Obtener la fecha actual en la zona horaria local
    const ahora = new Date();
    const year = ahora.getFullYear();
    const month = (ahora.getMonth() + 1).toString().padStart(2, '0');
    const day = ahora.getDate().toString().padStart(2, '0');
    const hoy = `${year}-${month}-${day}`;
    
    document.getElementById('fechaIngreso').value = hoy;
    document.getElementById("fechaSalida").value = hoy;

  } catch (error) {
    console.error("Error al obtener datos del conductor:", error);
    alert("Error al conectar con Firebase.");
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

// regresar al mine
function cerrarSesion (){
  window.location.href = '../paginas/loginEmpleado.html';
};

function regresarPincipalEmpleado (){
  window.location.href = '../paginas/principalEmpleado.html';
};

async function enviarIngreso() {
  const cedula = document.getElementById('cedulaEmpleado').value;
  const nombreCompleto = document.getElementById('nombreCompletoEmpleado').value;
  const fechaIngreso = document.getElementById('fechaIngreso').value;
  const horaIngreso = document.getElementById('horaIngreso').value;
  const ubicacionIngreso = document.getElementById('ubicacionIngreso').value;

  const data = {
    cedula,
    nombreCompleto,
    fechaIngreso,
    horaIngreso,
    ubicacionIngreso,
  };

  try {
    const response = await fetch("http://localhost:3001/enviarIngreso", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      alert("Datos de ingreso enviados correctamente.");
      document.getElementById('ingresoFieldset').style.display = 'none';
      document.getElementById('salidaFieldset').style.display = 'block';

      limpiarCamposIngreso();
    } else {
      alert("Error al enviar los datos de ingreso.");
    }
  } catch (error) {
    console.error("Error al enviar datos de ingreso:", error);
    alert("Error al conectar con el servidor.");
  }
}

async function enviarSalida() {
  const cedula = document.getElementById('cedulaEmpleado').value;
  const nombreCompleto = document.getElementById('nombreCompletoEmpleado').value;
  const fechaSalida = document.getElementById('fechaSalida').value;
  const horaSalida = document.getElementById('horaSalida').value;
  const ubicacionSalida = document.getElementById('ubicacionSalida').value;

  const data = {
    cedula,
    nombreCompleto,
    fechaSalida,
    horaSalida,
    ubicacionSalida,
  };


  
  try {
    const response = await fetch("http://localhost:3001/enviarSalida", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      alert("Datos de salida enviados correctamente.");
      document.getElementById('ingresoFieldset').style.display = 'block';
      document.getElementById('salidaFieldset').style.display = 'none';
      location.reload();
    } else {
      alert("Error al enviar los datos de salida.");
    }
  } catch (error) {
    console.error("Error al enviar datos de salida:", error);
    alert("Error al conectar con el servidor.");
  }
}

function limpiarCamposSalida() {
  document.getElementById('horaSalida').value = '';
  document.getElementById('ubicacionSalida').value = '';
}

function limpiarCamposIngreso() {
  document.getElementById('horaSalida').value = '';
  document.getElementById('ubicacionSalida').value = '';
}