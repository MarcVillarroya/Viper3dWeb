// Importar las dependencias necesarias
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Cargar las variables de entorno
dotenv.config();

// Configurar la conexión a la base de datos
const connectionConfig = {
  host: "containers-us-west-154.railway.app",
  user: "root",
  password: "OGprZgbrJS9sGg2QCTmC",
  database: "railway",
  dbport: "7013",
};

let connection;

// Crear la conexión a la base de datos
async function createConnection() {
  try {
    connection = await mysql.createConnection(connectionConfig);
    console.log('Connected to the database as ID:', connection.threadId);
  } catch (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
}

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
    await connection.execute(createTableQuery);
    console.log('Tabla de usuarios creada con éxito');
    await createDefaultAdminUser();
  } catch (err) {
    console.error('Error al crear la tabla de usuarios:', err.stack);
    return;
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
  const [results] = await connection.execute(findAdminQuery, [defaultAdmin.username]);

  if (results.length === 0) {
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(defaultAdmin.password, saltRounds);

      const insertAdminQuery = 'INSERT INTO users (username, email, country, password, registration_date, is_admin) VALUES (?, ?, ?, ?, ?, ?)';
      await connection.execute(
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
    const [result] = await connection.execute(insertUserQuery, [name, email, country, hashedPassword, registrationDate, isAdmin]);
    console.log('Usuario registrado con éxito. ID:', result.insertId);
  } catch (err) {
    console.error('Error al registrar usuario:', err);
    throw err;
  }
}

// Validar un usuario
async function validateUser(email, providedPassword) {
  try {
    const [result] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);

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

// Obtener usuarios
async function getUsers() {
  const [rows] = await connection.execute('SELECT * FROM users');
  return rows;
}

// Eliminar un usuario
async function deleteUserFromDatabase(userId) {
  await connection.execute('DELETE FROM users WHERE id = ?', [userId]);
}

// Crear la tabla 'users' al iniciar el módulo
createConnection().then(createUsersTable);

// Exportar las funciones para ser utilizadas en otros archivos
module.exports = {
  createUsersTable,
  createDefaultAdminUser,
  registerUser,
  validateUser,
  getUsers,
  deleteUserFromDatabase,
};
