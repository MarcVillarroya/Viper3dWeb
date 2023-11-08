// Importar las dependencias necesarias
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Cargar las variables de entorno
dotenv.config();

// Configurar el pool de conexiones a la base de datos
const pool = mysql.createPool({
  //host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  //port: process.env.MYSQLPORT, // Añade esta línea con el puerto específico
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
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
    await pool.execute(createTableQuery);
    console.log('Tabla de usuarios creada con éxito');
    await createDefaultAdminUser();
  } catch (err) {
    console.error('Error al crear la tabla de usuarios:', err.stack);
  }
}

// Crear el usuario administrador por defecto si no existe
async function createDefaultAdminUser() {
  const defaultAdmin = {
    username: 'ViperCEO',
    email: 'CEO@viper3d.com',
    country: 'España',
    password: 'Vi_per_3d_2023',
    isAdmin: true,
  };

  const findAdminQuery = 'SELECT * FROM users WHERE username = ?';
  const [results] = await pool.execute(findAdminQuery, [defaultAdmin.username]);

  if (results.length === 0) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(defaultAdmin.password, saltRounds);

    const insertAdminQuery = 'INSERT INTO users (username, email, country, password, registration_date, is_admin) VALUES (?, ?, ?, ?, NOW(), ?)';
    await pool.execute(
      insertAdminQuery,
      [
        defaultAdmin.username,
        defaultAdmin.email,
        defaultAdmin.country,
        hashedPassword,
        defaultAdmin.isAdmin,
      ]
    );
    console.log('Usuario administrador creado con éxito');
  } else {
    console.log('El usuario administrador ya existe');
  }
}

async function registerUser(name, email, country, password, isAdmin = false) {
  const hashedPassword = await bcrypt.hash(password, 12);

  const insertUserQuery = `
    INSERT INTO users (username, email, country, password, registration_date, is_admin)
    VALUES (?, ?, ?, ?, NOW(), ?);
  `;

  try {
    const [result] = await pool.execute(insertUserQuery, [name, email, country, hashedPassword, isAdmin]);
    console.log('Usuario registrado con éxito. ID:', result.insertId);
  } catch (err) {
    console.error('Error al registrar usuario:', err);
    throw err;
  }
}


// Validar un usuario
async function validateUser(email, providedPassword) {
  const [result] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);

  if (result.length > 0) {
    const user = result[0];
    const match = await bcrypt.compare(providedPassword, user.password);

    if (match) {
      return user;
    }
  }
  
  return null;
}

// Obtener usuarios
async function getUsers() {
  const [rows] = await pool.execute('SELECT * FROM users');
  return rows;
}

// Eliminar un usuario
async function deleteUserFromDatabase(userId) {
  await pool.execute('DELETE FROM users WHERE id = ?', [userId]);
}

// Crear la tabla 'users' al iniciar el módulo
createUsersTable();

// Exportar las funciones para ser utilizadas en otros archivos
module.exports = {
  createUsersTable,
  createDefaultAdminUser,
  registerUser,
  validateUser,
  getUsers,
  deleteUserFromDatabase,
};
