// Importar las dependencias necesarias
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Cargar las variables de entorno
dotenv.config();

// Configurar la conexión a la base de datos
const connectionConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
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

// Crear tabla de categorias
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
  } catch (err) {
    console.error('Error al crear la tabla de categorias:', err.stack);
    return;
  }
}

// Obtener todas las categorías
async function getCategories() {
  const queryText = 'SELECT * FROM categories';
  const [rows] = await connection.execute(queryText);
  return rows;
}

// Obtener una categoría por su ID
async function getCategoryById(id) {
  const queryText = 'SELECT * FROM categories WHERE id = ?';
  const [rows] = await connection.execute(queryText, [id]);
  return rows[0];
}

// Crear una nueva categoría
async function createCategory(name, description) {
  const queryText = 'INSERT INTO categories (name, description) VALUES (?, ?)';
  const args = [name, description];

  await connection.execute(queryText, args);

  return { name, description };
}

// Eliminar una categoría
async function deleteCategory(id) {
  const queryText = 'DELETE FROM categories WHERE id = ?';

  await connection.execute(queryText, [id]);
}

// Actualizar una categoría
async function updateCategory(id, name, description) {
  const queryText = 'UPDATE categories SET name = ?, description = ? WHERE id = ?';
  const args = [name, description, id];

  await connection.execute(queryText, args);
}

module.exports = {
  createConnection,
  createCategoriesTable,
  getCategories,
  createCategory,
  deleteCategory,
  updateCategory,
  getCategoryById,
};

// Finalmente, iniciar la conexión a la base de datos.
createConnection().then(createCategoriesTable);
