// Importar las dependencias necesarias
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

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

let connection;

async function initializeConnection() {
  try {
    connection = await mysql.createConnection(connectionConfig);
    console.log('Connected to the database as ID:', connection.threadId);
    createCategoriesTable();
  } catch (error) {
    console.error('Error connecting to the database:', error.stack);
  }
}

initializeConnection();

//Crear tabla de categorias:
async function createCategoriesTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT
    );
  `;

  try {
    await connection.execute(createTableQuery);
    console.log('Tabla de categorias creada con éxito');
  } catch (error) {
    console.error('Error al crear la tabla de categorias:', error.stack);
  }
}



// getCategories function
async function getCategories() {
  const [rows] = await connection.execute('SELECT * FROM categories');
  return rows;
}

// getCategoryById function
async function getCategoryById(id) {
  const [rows] = await connection.execute('SELECT * FROM categories WHERE id = ?', [id]);
  return rows[0];
}

// Crear una nueva categoría
async function createCategory(name, description) {
  const query = 'INSERT INTO categories (name, description) VALUES (?, ?)';
  const args = [name, description];

  // Ejecuta la consulta para insertar la nueva categoría en la base de datos
  await connection.execute(query, args);

  // Devuelve la nueva categoría creada como un objeto
  return { name, description };
}

// Eliminar una categoría
async function deleteCategory(id) {
  const query = 'DELETE FROM categories WHERE id = ?';
  const args = [id];

  await connection.execute(query, args);
}

// Actualizar una categoría
async function updateCategory(id, name, description) {
  const query = 'UPDATE categories SET name = ?, description = ? WHERE id = ?';
  const args = [name, description, id];

  await connection.execute(query, args);
}

// Exportar las funciones para ser utilizadas en otros archivos
module.exports = {
  createCategoriesTable,
  getCategories,
  createCategory,
  deleteCategory,
  updateCategory,
  getCategoryById,
};
module.exports.connection = connection;










