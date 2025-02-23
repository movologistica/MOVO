const SPREADSHEET_ID = '1I1Vpm2T0bX-3R6CT_1J4sG2kmcFbel8HDBiInkgAtng';
    const RANGE = 'login!A:C';

    function loadClient() {
      gapi.client.init({
        apiKey: 'AIzaSyAG9ROFzBPh3FkxdYQfOmAj9dMXv0IQYUc', 
        discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
      }).then(() => {
        obtenerNombreCompleto();
      }).catch(error => {
        console.error("Error al inicializar la API:", error);
      });
    }

    function obtenerNombreCompleto() {
      gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGE,
      }).then(response => {
        const data = response.result.values;
        if (data) {
          console.log("Datos obtenidos:", data); 
    
          // Omite la primera fila (encabezados)
          const filasUsuarios = data.slice(1);
    
          // Obtener la cédula del usuario actual desde sessionStorage
      const cedulaActual = sessionStorage.getItem('usuarioCedula');
      if (!cedulaActual) {
        console.error("No se encontró la cédula del usuario en sessionStorage.");
        alert("Error: No se encontró la cédula del usuario.");
        return;
      }

      // Buscar el usuario actual en las filas
      const usuarioActual = filasUsuarios.find(fila => fila[0] === cedulaActual);
      if (!usuarioActual) {
        console.error("No se encontró el usuario en la hoja de cálculo.");
        alert("Error: No se encontró el usuario.");
        return;
      }

      const nombreCompleto = usuarioActual[2];
    
          // Muestra el nombre completo
          document.getElementById("nombreCompleto").textContent = nombreCompleto;
        } else {
          console.error("No se encontraron datos en la hoja de cálculo.");
          alert("Error: No se encontraron datos.");
        }
      }).catch(error => {
        console.error("Error al obtener datos:", error);
        alert("Error al conectar con Google Sheets.");
      });
    }
    
    window.onload = () => {
      gapi.load('client', loadClient);
    };


    
    //cerrar sesion como empledo
  document.addEventListener("DOMContentLoaded", function() {
      const btnCerrarSesion = document.getElementById("cSesionEmpleado");
      if (btnCerrarSesion) {
          btnCerrarSesion.addEventListener("click", function() {
              sessionStorage.clear(); 
              window.location.href = "../index.html"; 
          });
      }
  });


  // entrar a auxiliar
  document.addEventListener("DOMContentLoaded", function() {
    const btnFormUrbano = document.getElementById("auxiliar");
    btnFormUrbano.addEventListener('click', function() {
      window.location.href = "../paginas/auxiliar.html";
    });
  });