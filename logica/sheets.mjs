import { google } from "googleapis";
import express from "express";
import cors from "cors";
import fs from "fs";

// Configurar Express
const app = express();
app.use(cors());
app.use(express.json());

// Cargar credenciales
import 'dotenv/config'
const googleCredentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);

// Ruta de la clave JSON
const KEY_PATH = "clave.json";
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

// Cargar credenciales
const auth = new google.auth.GoogleAuth({
  keyFile: KEY_PATH,
  scopes: SCOPES,
});

// ID de la hoja de cálculo
const SPREADSHEET_ID = "1I1Vpm2T0bX-3R6CT_1J4sG2kmcFbel8HDBiInkgAtng";

// Crear cliente de la API de Google Sheets
const sheets = google.sheets({ version: "v4", auth });

// Variable para almacenar el índice de la fila
const rowIndexMap = new Map(); // Asegurarnos de que esté definido correctamente

app.post("/enviarIngreso", async (req, res) => {
  const { cedula, nombreCompleto, fechaIngreso, horaIngreso, ubicacionIngreso } = req.body;

  try {
    // Agregar datos de ingreso
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "auxiliares!A2:E2", // Comenzar en la segunda fila
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [
          [cedula, nombreCompleto, fechaIngreso, horaIngreso, ubicacionIngreso],
        ],
      },
    });

    // Obtener el índice de la fila agregada
    const updatedRange = response.data.updates.updatedRange;
    const rowIndex = parseInt(updatedRange.match(/\d+/g).pop());

    // Guardar el índice de la fila en el mapa usando la cédula como clave
    rowIndexMap.set(cedula, rowIndex);

    res.status(200).send("Datos de ingreso enviados correctamente.");
  } catch (error) {
    console.error("Error al enviar datos de ingreso:", error);
    res.status(500).send("Error al enviar los datos de ingreso.");
  }
});

app.post("/enviarSalida", async (req, res) => {
  const { cedula, fechaSalida, horaSalida, ubicacionSalida } = req.body;

  try {
    // Obtener el índice de la fila desde el mapa usando la cédula como clave
    const rowIndex = rowIndexMap.get(cedula);

    if (!rowIndex) {
      return res.status(404).send("No se encontró la fila para actualizar.");
    }

    // Actualizar las columnas de salida en la fila encontrada
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `auxiliares!F${rowIndex}:H${rowIndex}`, // Actualizar las columnas de salida
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [
          [fechaSalida, horaSalida, ubicacionSalida],
        ],
      },
    });

    res.status(200).send("Datos de salida enviados correctamente.");
  } catch (error) {
    console.error("Error al enviar datos de salida:", error);
    res.status(500).send("Error al enviar los datos de salida.");
  }
});

// Escuchar en el puerto 3001
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
