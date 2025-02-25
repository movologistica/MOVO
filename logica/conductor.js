const SPREADSHEET_ID = '1I1Vpm2T0bX-3R6CT_1J4sG2kmcFbel8HDBiInkgAtng';
const CLIENT_ID = '1019271417877-fmsdkb8mfq3oi02o48k3rp2dm1mmia99.apps.googleusercontent.com';
const API_KEY = 'AIzaSyAG9ROFzBPh3FkxdYQfOmAj9dMXv0IQYUc';

let tokenClient;
let gapiInited = false;
let gisInited = false;

//funcionalidad de botones
document.addEventListener('DOMContentLoaded', () => {

    const cedula = localStorage.getItem('cedulaUsuario');
    const nombre = localStorage.getItem('nombreCompletoCond');
    if (cedula) {
        document.getElementById('cedulaCond').value = cedula;
        if (nombre) {
            document.getElementById('nombreCompletoCond').value = nombre;
        } else if (gapiInited) {
            buscarNombreCond(); // Llama a la función para buscar el nombre automáticamente
        }
    }
    verificarEstadoBotonesBloqueados();

    document.getElementById('cedulaCond').addEventListener('change', () => {
        if (gapiInited) {
            buscarNombreCond();
        }
    });
    document.getElementById('obtnerHoraIngreso').addEventListener('click', horaActialInicioLabores);
    document.getElementById('btninicioLabores').addEventListener('click', fechaInicioLabores);
    document.getElementById('enviarInicioLabores').addEventListener('click', enviarInicioLabores);
    document.getElementById('btnFechaYHoraCargue').addEventListener('click', fechaHorallegadaCargue);
    document.getElementById('enviarLlegadaCargue').addEventListener('click', enviarLlegadaCargue);
    document.getElementById('btnFYHInicioCargue').addEventListener('click', fechaHoraInicioCargue);
    document.getElementById('enviarInicioCargue').addEventListener('click', enviarInicioCargue);
    document.getElementById('btnFYHFinCargue').addEventListener('click', fechaHoraFinCargue);
    document.getElementById('enviarFinCargue').addEventListener('click', enviarFinCargue);
    document.getElementById('btnFYHLlegadaDes').addEventListener('click', fechaHoraLlegadaDes);
    document.getElementById('enviarLlegadaDes').addEventListener('click', enviarLlegadaDescargue);
    document.getElementById('btnFYHInicioDes').addEventListener('click', fechaHoraInicioDes);
    document.getElementById('enviarInicioDes').addEventListener('click', enviarInicioDescargue);
    document.getElementById('btnFYHFinDes').addEventListener('click', fechaHoraFinDes);
    document.getElementById('enviarFinDes').addEventListener('click', enviarFinDescargue);
    document.getElementById('btnfinLabores').addEventListener('click', fechaFinLabores);
    document.getElementById('obtnerHoraFinLabores').addEventListener('click', horaActualFinLabores);
    document.getElementById('enviarFinLabores').addEventListener('click', enviarFinLabores);

    //boton cerrar sesion
    document.getElementById('cerrarSesionCond').addEventListener('click', cerrarSesion);
    document.getElementById('regresarPrincipalEmpelado').addEventListener('click', regresarPageAnterior);

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
        // Llama a buscarNombreCond si la cédula ya está almacenada
        const cedula = localStorage.getItem('cedulaUsuario');
        if (cedula) {
            buscarNombreCond();
        }
    });
}
  
  //buscar el nombre en base de datos
  function buscarNombreCond() {
    const cedula = document.getElementById('cedulaCond').value;
    if (cedula) {
        localStorage.setItem('cedulaUsuario', cedula); // Almacenar la cédula en localStorage
        gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'basededatos!A:B',
        }).then(response => {
            const rows = response.result.values;
            const user = rows.find(row => row[0] === cedula);
            const nombre = user ? user[1] : '';
            document.getElementById('nombreCompletoCond').value = nombre;
            localStorage.setItem('nombreCompletoCond', nombre); // Almacenar el nombre en localStorage
        });
    } else {
        document.getElementById('nombreCompletoCond').value = '';
    }
}

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

//obtener fecha actual para inicio de labores
function fechaInicioLabores() {
    const hoy = new Date();
    const dia = hoy.getDate().toString().padStart(2, '0');
    const mes = (hoy.getMonth() + 1).toString().padStart(2, '0'); // Los meses empiezan desde 0
    const año = hoy.getFullYear();
    document.getElementById('icioLabores').value = `${año}-${mes}-${dia}`;
}

//obtener hora actual para inicio de labores
function horaActialInicioLabores() {
    const ahora = new Date();
    const horas = ahora.getHours().toString().padStart(2, '0');
    const minutos = ahora.getMinutes().toString().padStart(2, '0');
    document.getElementById('horaIniciolabores').value = `${horas}:${minutos}`;
}

//enviar inicio de labores al sheets
function enviarInicioLabores () {
  const cedula = document.getElementById('cedulaCond').value;
  const nombre = document.getElementById('nombreCompletoCond').value;
  const fechaInicioLabores = document.getElementById('icioLabores').value;
  const horaIniciolabores = document.getElementById('horaIniciolabores').value;

  if (!cedula || !nombre || !fechaInicioLabores || !horaIniciolabores) {
    alert('Por favor, complete todos los campos antes de enviar.');
    return;
  }

  localStorage.setItem('cedulaUsuario', cedula); // Almacenar la cédula en localStorage
localStorage.setItem('nombreCompletoCond', nombre); // Almacenar el nombre en localStorage

  const values = [
    [cedula, nombre, fechaInicioLabores, horaIniciolabores]
  ];

  gapi.client.sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Conductores!A:D',
    valueInputOption: 'RAW',
    resource: {
      values
    }
  }).then((response) => {
    console.log(`${response.result.updates.updatedCells} celdas actualizadas.`);
    rowNumber = response.result.updates.updatedRange.match(/\d+$/)[0]; // Obtener el número de fila actualizado
    localStorage.setItem('estadoInicioLabores', JSON.stringify({ rowNumber }));
    bloquearBoton('btninicioLabores');
    alert('Inicio de Labores enviado'); // Añadir alerta aquí
  }, (error) => {
    console.error('Error al enviar los datos:', error);
    alert('Error al enviar los datos. Por favor, intente nuevamente.');
  });
}

// modal reportar llegada a cargue
document.addEventListener('DOMContentLoaded', (event) => {
    const btnInicioLabores = document.getElementById('btnllegadaCargue');
    const modalInicioLabores = document.getElementById('modalLlegadaCargue');
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

function fechaHorallegadaCargue() {
    const ahora = new Date();
    const año = ahora.getFullYear();
    const mes = (ahora.getMonth() + 1).toString().padStart(2, '0'); // Los meses empiezan desde 0
    const dia = ahora.getDate().toString().padStart(2, '0');
    const horas = ahora.getHours().toString().padStart(2, '0');
    const minutos = ahora.getMinutes().toString().padStart(2, '0');
    const fechaHoraActual = `${año}-${mes}-${dia}T${horas}:${minutos}`;
    document.getElementById('LlegadaCargue').value = fechaHoraActual;
}

// enviar llegada a cargue al sheets
function enviarLlegadaCargue() {
    const cedula = document.getElementById('cedulaCond').value;
    const fechaHoraLlegada = document.getElementById('LlegadaCargue').value;

    if (!cedula || !fechaHoraLlegada) {
        alert('Por favor, complete todos los campos antes de enviar.');
        return;
    }

    const estadoInicioLabores = JSON.parse(localStorage.getItem('estadoInicioLabores'));
    if (!estadoInicioLabores || !estadoInicioLabores.rowNumber) {
        alert('No se encontró el estado de ingreso. Por favor, reporte el inicio de labores primero.');
        return;
    }

    const rowNumber = estadoInicioLabores.rowNumber;
    const range = `Conductores!E${rowNumber}`; // Suponiendo que la columna E es la siguiente a actualizar

    const values = [
        [fechaHoraLlegada]
    ];

    gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: range,
        valueInputOption: 'RAW',
        resource: {
            values
        }
    }).then((response) => {
        console.log(`${response.result.updatedCells} celdas actualizadas.`);
        bloquearBoton('btnllegadaCargue');
        alert('Llegada al cargue enviada');
        
    }, (error) => {
        console.error('Error al enviar los datos:', error);
        alert('Error al enviar los datos. Por favor, intente nuevamente.');
    });
}

// modal reportar inicio de cargue
document.addEventListener('DOMContentLoaded', (event) => {
    const btnInicioCargue = document.getElementById('btninicioCargue');
    const modalInicioCargue = document.getElementById('modalInicioCargue');
    const closeModal = modalInicioCargue.querySelector('.close');

    btnInicioCargue.addEventListener('click', () => {
        modalInicioCargue.style.display = 'block';
    });

    closeModal.addEventListener('click', () => {
        modalInicioCargue.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == modalInicioCargue) {
            modalInicioCargue.style.display = 'none';
        }
    });
});

//obtener fecha y hora actual para inicio de cargue
function fechaHoraInicioCargue() {
    const ahora = new Date();
    const año = ahora.getFullYear();
    const mes = (ahora.getMonth() + 1).toString().padStart(2, '0'); // Los meses empiezan desde 0
    const dia = ahora.getDate().toString().padStart(2, '0');
    const horas = ahora.getHours().toString().padStart(2, '0');
    const minutos = ahora.getMinutes().toString().padStart(2, '0');
    const fechaHoraActual = `${año}-${mes}-${dia}T${horas}:${minutos}`;
    document.getElementById('inicioCargue').value = fechaHoraActual;
}

//enviar inicio de cargue a sheets
function enviarInicioCargue() {
    const cedula = document.getElementById('cedulaCond').value;
    const fechaHoraInicioCargue = document.getElementById('inicioCargue').value;

    if (!cedula || !fechaHoraInicioCargue) {
        alert('Por favor, complete todos los campos antes de enviar.');
        return;
    }

    const estadoInicioLabores = JSON.parse(localStorage.getItem('estadoInicioLabores'));
    if (!estadoInicioLabores || !estadoInicioLabores.rowNumber) {
        alert('No se encontró el estado de ingreso. Por favor, reporte el inicio de labores primero.');
        return;
    }

    const rowNumber = estadoInicioLabores.rowNumber;
    const range = `Conductores!F${rowNumber}`; // Suponiendo que la columna E es la siguiente a actualizar

    const values = [
        [fechaHoraInicioCargue]
    ];

    gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: range,
        valueInputOption: 'RAW',
        resource: {
            values
        }
    }).then((response) => {
        console.log(`${response.result.updatedCells} celdas actualizadas.`);
        bloquearBoton('btninicioCargue');
        alert('Llegada al cargue enviada');
    }, (error) => {
        console.error('Error al enviar los datos:', error);
        alert('Error al enviar los datos. Por favor, intente nuevamente.');
    });
}

// modal reportar fin de cargue
document.addEventListener('DOMContentLoaded', (event) => {
    const btnFinCargue = document.getElementById('btnfinCargue');
    const modalFinCargue = document.getElementById('modalFinCargue');
    const closeModal = modalFinCargue.querySelector('.close');

    btnFinCargue.addEventListener('click', () => {
        modalFinCargue.style.display = 'block';
    });

    closeModal.addEventListener('click', () => {
        modalFinCargue.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == modalFinCargue) {
            modalFinCargue.style.display = 'none';
        }
    });
});

//obtener fecha y hora actual para fin de cargue
function fechaHoraFinCargue() {
    const ahora = new Date();
    const año = ahora.getFullYear();
    const mes = (ahora.getMonth() + 1).toString().padStart(2, '0'); // Los meses empiezan desde 0
    const dia = ahora.getDate().toString().padStart(2, '0');
    const horas = ahora.getHours().toString().padStart(2, '0');
    const minutos = ahora.getMinutes().toString().padStart(2, '0');
    const fechaHoraActual = `${año}-${mes}-${dia}T${horas}:${minutos}`;
    document.getElementById('finCargue').value = fechaHoraActual;
}

//enviar fin cargue a sheets
function enviarFinCargue() {
    const cedula = document.getElementById('cedulaCond').value;
    const fechaHoraFinCargue = document.getElementById('finCargue').value;

    if (!cedula || !fechaHoraFinCargue) {
        alert('Por favor, complete todos los campos antes de enviar.');
        return;
    }

    const estadoInicioLabores = JSON.parse(localStorage.getItem('estadoInicioLabores'));
    if (!estadoInicioLabores || !estadoInicioLabores.rowNumber) {
        alert('No se encontró el estado de ingreso. Por favor, reporte el inicio de labores primero.');
        return;
    }

    const rowNumber = estadoInicioLabores.rowNumber;
    const range = `Conductores!G${rowNumber}`; 

    const values = [
        [fechaHoraFinCargue]
    ];

    gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: range,
        valueInputOption: 'RAW',
        resource: {
            values
        }
    }).then((response) => {
        console.log(`${response.result.updatedCells} celdas actualizadas.`);
        bloquearBoton('btnfinCargue');
        alert('Llegada al cargue enviada');
    }, (error) => {
        console.error('Error al enviar los datos:', error);
        alert('Error al enviar los datos. Por favor, intente nuevamente.');
    });
}

// modal reportar llegada al descargue
document.addEventListener('DOMContentLoaded', (event) => {
    const btnLlegadaDes = document.getElementById('btnllegadaDescargue');
    const modalLlegadaDes = document.getElementById('modalLegadaDescargue');
    const closeModal = modalLlegadaDes.querySelector('.close');

    btnLlegadaDes.addEventListener('click', () => {
        modalLlegadaDes.style.display = 'block';
    });

    closeModal.addEventListener('click', () => {
        modalLlegadaDes.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == modalLlegadaDes) {
            modalLlegadaDes.style.display = 'none';
        }
    });
});

//obtener fecha y hora actual para la llegada al descargue
function fechaHoraLlegadaDes() {
    const ahora = new Date();
    const año = ahora.getFullYear();
    const mes = (ahora.getMonth() + 1).toString().padStart(2, '0'); // Los meses empiezan desde 0
    const dia = ahora.getDate().toString().padStart(2, '0');
    const horas = ahora.getHours().toString().padStart(2, '0');
    const minutos = ahora.getMinutes().toString().padStart(2, '0');
    const fechaHoraActual = `${año}-${mes}-${dia}T${horas}:${minutos}`;
    document.getElementById('LlegadaDescargue').value = fechaHoraActual;
}

//enviar llegada al decargue a sheets
function enviarLlegadaDescargue() {
    const cedula = document.getElementById('cedulaCond').value;
    const fechaHoraLlegadaDes = document.getElementById('LlegadaDescargue').value;

    if (!cedula || !fechaHoraLlegadaDes) {
        alert('Por favor, complete todos los campos antes de enviar.');
        return;
    }

    const estadoInicioLabores = JSON.parse(localStorage.getItem('estadoInicioLabores'));
    if (!estadoInicioLabores || !estadoInicioLabores.rowNumber) {
        alert('No se encontró el estado de ingreso. Por favor, reporte el inicio de labores primero.');
        return;
    }

    const rowNumber = estadoInicioLabores.rowNumber;
    const range = `Conductores!H${rowNumber}`; 

    const values = [
        [fechaHoraLlegadaDes]
    ];

    gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: range,
        valueInputOption: 'RAW',
        resource: {
            values
        }
    }).then((response) => {
        console.log(`${response.result.updatedCells} celdas actualizadas.`);
        bloquearBoton('btnllegadaDescargue');
        alert('Llegada al cargue enviada');
    }, (error) => {
        console.error('Error al enviar los datos:', error);
        alert('Error al enviar los datos. Por favor, intente nuevamente.');
    });
}

// modal reportar Inicio descargue
document.addEventListener('DOMContentLoaded', (event) => {
    const btnInicioDescargue = document.getElementById('btninicioDescargue');
    const modalLlegadaDes = document.getElementById('modalInicioDescargue');
    const closeModal = modalLlegadaDes.querySelector('.close');

    btnInicioDescargue.addEventListener('click', () => {
        modalLlegadaDes.style.display = 'block';
    });

    closeModal.addEventListener('click', () => {
        modalLlegadaDes.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == modalLlegadaDes) {
            modalLlegadaDes.style.display = 'none';
        }
    });
});

//obtener fecha y hora actual para inicio descargue
function fechaHoraInicioDes() {
    const ahora = new Date();
    const año = ahora.getFullYear();
    const mes = (ahora.getMonth() + 1).toString().padStart(2, '0'); // Los meses empiezan desde 0
    const dia = ahora.getDate().toString().padStart(2, '0');
    const horas = ahora.getHours().toString().padStart(2, '0');
    const minutos = ahora.getMinutes().toString().padStart(2, '0');
    const fechaHoraActual = `${año}-${mes}-${dia}T${horas}:${minutos}`;
    document.getElementById('InicioDescargue').value = fechaHoraActual;
}

//enviar inicio al descargue a sheets
function enviarInicioDescargue() {
    const cedula = document.getElementById('cedulaCond').value;
    const fechaHoraInicioDes = document.getElementById('InicioDescargue').value;

    if (!cedula || !fechaHoraInicioDes) {
        alert('Por favor, complete todos los campos antes de enviar.');
        return;
    }

    const estadoInicioLabores = JSON.parse(localStorage.getItem('estadoInicioLabores'));
    if (!estadoInicioLabores || !estadoInicioLabores.rowNumber) {
        alert('No se encontró el estado de ingreso. Por favor, reporte el inicio de labores primero.');
        return;
    }

    const rowNumber = estadoInicioLabores.rowNumber;
    const range = `Conductores!I${rowNumber}`; 

    const values = [
        [fechaHoraInicioDes]
    ];

    gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: range,
        valueInputOption: 'RAW',
        resource: {
            values
        }
    }).then((response) => {
        console.log(`${response.result.updatedCells} celdas actualizadas.`);
        bloquearBoton('btninicioDescargue');
        alert('Llegada al cargue enviada');
    }, (error) => {
        console.error('Error al enviar los datos:', error);
        alert('Error al enviar los datos. Por favor, intente nuevamente.');
    });
}

// modal reportar fin descargue
document.addEventListener('DOMContentLoaded', (event) => {
    const btnFinDescargue = document.getElementById('btnfinDescargue');
    const modalLlegadaDes = document.getElementById('modalFinDescargue');
    const closeModal = modalLlegadaDes.querySelector('.close');

    btnFinDescargue.addEventListener('click', () => {
        modalLlegadaDes.style.display = 'block';
    });

    closeModal.addEventListener('click', () => {
        modalLlegadaDes.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == modalLlegadaDes) {
            modalLlegadaDes.style.display = 'none';
        }
    });
});

//obtener fecha y hora actual para fin de descargue
function fechaHoraFinDes() {
    const ahora = new Date();
    const año = ahora.getFullYear();
    const mes = (ahora.getMonth() + 1).toString().padStart(2, '0'); // Los meses empiezan desde 0
    const dia = ahora.getDate().toString().padStart(2, '0');
    const horas = ahora.getHours().toString().padStart(2, '0');
    const minutos = ahora.getMinutes().toString().padStart(2, '0');
    const fechaHoraActual = `${año}-${mes}-${dia}T${horas}:${minutos}`;
    document.getElementById('FinDescargue').value = fechaHoraActual;
}

//enviar fin descargue a sheets
function enviarFinDescargue() {
    const cedula = document.getElementById('cedulaCond').value;
    const fechaHoraFinDescargue = document.getElementById('FinDescargue').value;

    if (!cedula || !fechaHoraFinDescargue) {
        alert('Por favor, complete todos los campos antes de enviar.');
        return;
    }

    const estadoInicioLabores = JSON.parse(localStorage.getItem('estadoInicioLabores'));
    if (!estadoInicioLabores || !estadoInicioLabores.rowNumber) {
        alert('No se encontró el estado de ingreso. Por favor, reporte el inicio de labores primero.');
        return;
    }

    const rowNumber = estadoInicioLabores.rowNumber;
    const range = `Conductores!J${rowNumber}`; 

    const values = [
        [fechaHoraFinDescargue]
    ];

    gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: range,
        valueInputOption: 'RAW',
        resource: {
            values
        }
    }).then((response) => {
        console.log(`${response.result.updatedCells} celdas actualizadas.`);
        bloquearBoton('btnfinDescargue');
        alert('Llegada al cargue enviada');
    }, (error) => {
        console.error('Error al enviar los datos:', error);
        alert('Error al enviar los datos. Por favor, intente nuevamente.');
    });
}

// modal reportar fin labores
document.addEventListener('DOMContentLoaded', (event) => {
    const btnFinDescargue = document.getElementById('btnfinLabores');
    const modalLlegadaDes = document.getElementById('modalFinLabores');
    const closeModal = modalLlegadaDes.querySelector('.close');

    btnFinDescargue.addEventListener('click', () => {
        modalLlegadaDes.style.display = 'block';
    });

    closeModal.addEventListener('click', () => {
        modalLlegadaDes.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == modalLlegadaDes) {
            modalLlegadaDes.style.display = 'none';
        }
    });
});

//obtener fecha actual para fin de labores
function fechaFinLabores() {
    const hoy = new Date();
    const dia = hoy.getDate().toString().padStart(2, '0');
    const mes = (hoy.getMonth() + 1).toString().padStart(2, '0'); // Los meses empiezan desde 0
    const año = hoy.getFullYear();
    document.getElementById('finLabores').value = `${año}-${mes}-${dia}`;
}

//obtener hora actual para fin de labores
function horaActualFinLabores() {
    const ahora = new Date();
    const horas = ahora.getHours().toString().padStart(2, '0');
    const minutos = ahora.getMinutes().toString().padStart(2, '0');
    document.getElementById('horaFinlabores').value = `${horas}:${minutos}`;
}

//enviar fin de labores al sheets
function enviarFinLabores() {
    const cedula = document.getElementById('cedulaCond').value;
    const fechaFinLabores = document.getElementById('finLabores').value;
    const horaFinlabores = document.getElementById('horaFinlabores').value;

    if (!cedula || !fechaFinLabores || !horaFinlabores) {
        alert('Por favor, complete todos los campos antes de enviar.');
        return;
    }

    const estadoInicioLabores = JSON.parse(localStorage.getItem('estadoInicioLabores'));
    if (!estadoInicioLabores || !estadoInicioLabores.rowNumber) {
        alert('No se encontró el estado de ingreso. Por favor, reporte el inicio de labores primero.');
        return;
    }

    const rowNumber = estadoInicioLabores.rowNumber;
    const range = `Conductores!K${rowNumber}:L${rowNumber}`;

    const values = [
        [fechaFinLabores, horaFinlabores]
    ];

    gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: range,
        valueInputOption: 'RAW',
        resource: {
            values
        }
    }).then((response) => {
        console.log(`${response.result.updatedCells} celdas actualizadas.`);
        desbloquearBotones();
        alert('Fin de Labores enviado');
    }, (error) => {
        console.error('Error al enviar los datos:', error);
        alert('Error al enviar los datos. Por favor, intente nuevamente.');
    });
}

// bloquear botones
function bloquearBoton(id) {
    const boton = document.getElementById(id);
    if (boton) {
        boton.disabled = true;
        boton.classList.add('boton-bloqueado');
        localStorage.setItem(id, 'disabled');
    }
}

// desbloquear botones
function desbloquearBotones() {
    const botones = [
        'btninicioLabores', 'btnllegadaCargue', 'btninicioCargue', 'btnfinCargue',
        'btnllegadaDescargue', 'btninicioDescargue', 'btnfinDescargue', 'btnfinLabores'
    ];
    botones.forEach(id => {
        const boton = document.getElementById(id);
        if (boton) {
            boton.disabled = false;
            boton.classList.remove('boton-bloqueado');
            localStorage.removeItem(id);
        }
    });
}

function verificarEstadoBotonesBloqueados() {
    const botones = [
        'btninicioLabores', 'btnllegadaCargue', 'btninicioCargue', 'btnfinCargue',
        'btnllegadaDescargue', 'btninicioDescargue', 'btnfinDescargue', 'btnfinLabores'
    ];
    botones.forEach(id => {
        const boton = document.getElementById(id);
        if (localStorage.getItem(id) === 'disabled' && boton) {
            boton.disabled = true;
            boton.classList.add('boton-bloqueado');
        }
    });
}


// regresar al mine
function cerrarSesion (){
    window.location.href = '../paginas/loginEmpleado.html';
  };
  
  function regresarPageAnterior (){
    window.location.href = '../paginas/principalEmpleado.html';
  };    