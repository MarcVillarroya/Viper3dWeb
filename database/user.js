// Importar las dependencias necesarias
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const util = require('util');


// El resto del código del archivo sigue aquí

dotenv.config();
// Configurar la conexión a la base de datos
const connectionConfig = {
  host: "containers-us-west-154.railway.app",
  user: "root",
  password: "OGprZgbrJS9sGg2QCTmC",
  database: "railway",
  port: 7013,
  // Puedes intentar añadir esto si las conexiones regulares no funcionan
  // ssl: { rejectUnauthorized: false }
};


// Crear la conexión a la base de datos
const connection = mysql.createConnection(connectionConfig);

// Conectar a la base de datos
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the database as ID:', connection.threadId);
});

// Crear la tabla 'users' si no existe
function createUsersTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      country VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      registration_date DATETIME NOT NULL,
      is_admin BOOLEAN NOT NULL
    );
  `;

  connection.query(createTableQuery, (err) => {
    if (err) {
      console.error('Error al crear la tabla de usuarios:', err.stack);
      return;
    }

    console.log('Tabla de usuarios creada con éxito');
    createDefaultAdminUser();
  });
}

// Crear el usuario administrador por defecto si no existe
function createDefaultAdminUser() {
  const defaultAdmin = {
    username: 'admin',
    email: 'admin@example.com',
    country: 'Unknown',
    password: 'Unanueva2017',
    isAdmin: true,
  };

  const findAdminQuery = 'SELECT * FROM users WHERE username = ?';
  connection.query(findAdminQuery, [defaultAdmin.username], async (err, results) => {
    if (err) {
      console.error('Error al buscar usuario administrador:', err.stack);
      return;
    }

    if (results.length === 0) {
      try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(defaultAdmin.password, saltRounds);

        const insertAdminQuery = 'INSERT INTO users (username, email, country, password, registration_date, is_admin) VALUES (?, ?, ?, ?, ?, ?)';
        connection.query(
          insertAdminQuery,
          [
            defaultAdmin.username,
            defaultAdmin.email,
            defaultAdmin.country,
            hashedPassword,
            new Date(),
            defaultAdmin.isAdmin,
          ],
          (err) => {
            if (err) {
              console.error('Error al crear usuario administrador:', err.stack);
              return;
            }

            console.log('Usuario administrador creado con éxito');
          }
        );
      } catch (error) {
        console.error('Error al encriptar la contraseña:', error.stack);
      }
    } else {
      console.log('El usuario administrador ya existe');
    }
  });
}

// Registrar un nuevo usuario
async function registerUser(name, email, country, password, registrationDate, isAdmin) {
  const hashedPassword = await bcrypt.hash(password, 12);

  const insertUserQuery = `
    INSERT INTO users (username, email, country, password, registration_date, is_admin)
    VALUES (?, ?, ?, ?, ?, 0);
  `;

  return new Promise((resolve, reject) => {
    connection.query(insertUserQuery, [name, email, country, hashedPassword, registrationDate, isAdmin], (err, result) => {
     

      if (err) {
        console.error('Error al registrar usuario:', err);
        reject(err);
        return;
      }

      console.log('Usuario registrado con éxito. ID:', result.insertId);
      resolve();
    });
  });
}

// Crear la tabla 'users' al iniciar el módulo
createUsersTable();

//login de usuario

const query = util.promisify(connection.query).bind(connection);

async function validateUser(email, providedPassword) {
  try {
    const result = await query('SELECT * FROM users WHERE email = ?', [email]);

    if (result.length > 0) {
      const user = result[0];
      const match = await bcrypt.compare(providedPassword, user.password);

      if (match) {
        return user;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error al validar el usuario:', error);
    throw error;
  }
}

// getUsers function
async function getUsers() {
  const queryText = 'SELECT * FROM users';
  const rows = await query(queryText);
  return rows;
}

async function deleteUserFromDatabase(userId) {
  const deleteQuery = 'DELETE FROM users WHERE id = ?';
  await query(deleteQuery, [userId]);
}


// Exportar las funciones para ser utilizadas en otros archivos

module.exports = {
  query,
  createUsersTable,
  createDefaultAdminUser,
  registerUser,
  validateUser,
  getUsers,
  deleteUserFromDatabase,
  };

  module.exports.connection = connection;


