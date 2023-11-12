const { google } = require('googleapis');
const multer = require('multer');
const stream = require('stream');

// Configura la autenticación de Google utilizando las variables de entorno
const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/gm, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const driveService = google.drive({ version: 'v3', auth });

const uploadFileToGoogleDrive = async (fileObject, isVideo) => {
    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileObject.buffer);

    const folderId = isVideo ? '13GpXRx0KOVynwvcU4RdFm35fnyYt4MrL' : '1ldv5248POuRX4O39RF7snLksx8Uj7snh'; // Reemplaza con tus IDs de carpetas

    const { data } = await driveService.files.create({
        media: {
            mimeType: fileObject.mimetype,
            body: bufferStream,
        },
        requestBody: {
            name: fileObject.originalname,
            parents: [folderId],
        },
        fields: 'id',
    });

    return data.id;
};

const deleteFileFromGoogleDrive = async (fileId) => {
  try {
      await driveService.files.delete({
          fileId: fileId,
      });
  } catch (error) {
      console.error('Error al eliminar archivo de Google Drive:', error);
      throw error; // Lanzar el error para manejarlo en el llamador
  }
};

const upload = multer({
    storage: multer.memoryStorage(),
});

module.exports = { upload, uploadFileToGoogleDrive, deleteFileFromGoogleDrive };


