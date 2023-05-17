// Importar las dependencias necesarias
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// El resto del código del archivo sigue aquí

dotenv.config();
// Configurar la conexión a la base de datos
const connectionConfig = {
  host:"containers-us-west-154.railway.app",
  user: "root",
  password: "OGprZgbrJS9sGg2QCTmC",
  database: "railway",
  port: "7013"
};

//const connectionConfig = {
//  host: process.env.DB_HOST,
//  user: process.env.DB_USER,
//  password: process.env.DB_PASSWORD,
//  database: process.env.DB_DATABASE,
//};

// Crear la conexión a la base de datos
let connection;

async function initializeConnection() {
  connection = await mysql.createConnection(connectionConfig);
  console.log('Connected to the database as ID:', connection.threadId);
  createUsersTable().catch(console.error);
}

initializeConnection().catch(err => {
  console.error('Error connecting to the database:', err.stack);
});

// Crear la tabla 'users' si no existe
async function createUsersTable() {
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

  try {
    await connection.query(createTableQuery);
    console.log('Tabla de usuarios creada con éxito');
    createDefaultAdminUser();
  } catch (err) {
    console.error('Error al crear la tabla de usuarios:', err.stack);
  }
}

// Crear el usuario administrador por defecto si no existe
async function createDefaultAdminUser() {
  const defaultAdmin = {
    username: 'admin',
    email: 'admin@example.com',
    country: 'Unknown',
    password: 'Unanueva2017',
    isAdmin: true,
  };

  const findAdminQuery = 'SELECT * FROM users WHERE username = ?';
  const [results] = await connection.query(findAdminQuery, [defaultAdmin.username]);

  if (results.length === 0) {
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(defaultAdmin.password, saltRounds);

      const insertAdminQuery = 'INSERT INTO users (username, email, country, password, registration_date, is_admin) VALUES (?, ?, ?, ?, ?, ?)';
      await connection.query(
        insertAdminQuery,
        [
          defaultAdmin.username,
          defaultAdmin.email,
          defaultAdmin.country,
          hashedPassword,
          new Date(),
          defaultAdmin.isAdmin,
        ]
      );

      console.log('Usuario administrador creado con éxito');
    } catch (error) {
      console.error('Error al encriptar la contraseña:', error.stack);
    }
  } else {
    console.log('El usuario administrador ya existe');
  }
}

// Registrar un nuevo usuario
async function registerUser(name, email, country, password, registrationDate, isAdmin) {
  const hashedPassword = await bcrypt.hash(password, 12);

  const insertUserQuery = `
    INSERT INTO users (username, email, country, password, registration_date, is_admin)
    VALUES (?, ?, ?, ?, ?, 0);
  `;

  try {
    await connection.query(insertUserQuery, [name, email, country, hashedPassword, registrationDate, isAdmin]);
    console.log('Usuario registrado con éxito.');
  } catch (err) {
    console.error('Error al registrar usuario:', err);
    throw err;
  }
}

//login de usuario
async function validateUser(email, providedPassword) {
  try {
    const [result] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);

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
  const [rows] = await connection.query('SELECT * FROM users');
  return rows;
}

async function deleteUserFromDatabase(userId) {
  const deleteQuery = 'DELETE FROM users WHERE id = ?';
  await connection.query(deleteQuery, [userId]);
}


// Exportar las funciones para ser utilizadas en otros archivos
module.exports = {
  createUsersTable,
  createDefaultAdminUser,
  registerUser,
  validateUser,
  getUsers,
  deleteUserFromDatabase,
};

module.exports.connection = connection;
