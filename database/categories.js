// Importar las dependencias necesarias
const mysql = require('mysql2/promise');
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




// Crear tabla de categorías
async function createCategoriesTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT
    );
  `;

  try {
    await pool.execute(createTableQuery);
    console.log('Tabla de categorías creada con éxito');
  } catch (err) {
    console.error('Error al crear la tabla de categorías:', err.stack);
  }
}

// Obtener todas las categorías
async function getCategories() {
  const queryText = 'SELECT * FROM categories';
  const [rows] = await pool.execute(queryText);
  return rows;
}

// Obtener una categoría por su ID
async function getCategoryById(id) {
  const queryText = 'SELECT * FROM categories WHERE id = ?';
  const [rows] = await pool.execute(queryText, [id]);
  return rows[0];
}

// Crear una nueva categoría
async function createCategory(name, description) {
  const queryText = 'INSERT INTO categories (name, description) VALUES (?, ?)';
  const args = [name, description];

  await pool.execute(queryText, args);

  return { name, description };
}

// Eliminar una categoría
async function deleteCategory(id) {
  const queryText = 'DELETE FROM categories WHERE id = ?';

  await pool.execute(queryText, [id]);
}

// Actualizar una categoría
async function updateCategory(id, name, description) {
  const queryText = 'UPDATE categories SET name = ?, description = ? WHERE id = ?';
  const args = [name, description, id];

  await pool.execute(queryText, args);
}

module.exports = {
  createCategoriesTable,
  getCategories,
  createCategory,
  deleteCategory,
  updateCategory,
  getCategoryById,
};

// Crear la tabla 'categories' al iniciar el módulo
createCategoriesTable();
