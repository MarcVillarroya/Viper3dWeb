// Importar las dependencias necesarias
const mysql = require('mysql');
const dotenv = require('dotenv');
const util = require('util');

//

dotenv.config();
// Configurar la conexión a la base de datos
const connectionConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
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

//Crear tabla de categorias:
function createCategoriesTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT
    );
  `;

  connection.query(createTableQuery, (err) => {
    if (err) {
      console.error('Error al crear la tabla de categorias:', err.stack);
      return;
    }

    console.log('Tabla de categorias creada con éxito');
  });
}

createCategoriesTable();

const query = util.promisify(connection.query).bind(connection);

// getCategories function
async function getCategories() {
  const queryText = 'SELECT * FROM categories';
  const rows = await query(queryText);
  return rows;
}

// getCategoryById function
async function getCategoryById(id) {
  const queryText = 'SELECT * FROM categories WHERE id = ?';
  const rows = await query(queryText, [id]);
  return rows[0];
}


// Crear una nueva categoría
async function createCategory(name, description) {
  const query = 'INSERT INTO categories (name, description) VALUES (?, ?)';
  const args = [name, description];

  // Ejecuta la consulta para insertar la nueva categoría en la base de datos
  await util.promisify(connection.query).call(connection, query, args);

  // Devuelve la nueva categoría creada como un objeto
  return { name, description };
}

// Eliminar una categoría
async function deleteCategory(id) {
  const query = 'DELETE FROM categories WHERE id = ?';
  const args = [id];

  await util.promisify(connection.query).call(connection, query, args);
}
// Actualizar una categoría
async function updateCategory(id, name, description) {
  const query = 'UPDATE categories SET name = ?, description = ? WHERE id = ?';
  const args = [name, description, id];

  await util.promisify(connection.query).call(connection, query, args);
}

// Exportar las funciones para ser utilizadas en otros archivos
module.exports = {
  // Exporta las funciones existentes y agrega la función `getCategories`
  query,
  createCategoriesTable,
  getCategories,
  createCategory,
  deleteCategory,
  updateCategory,
  getCategoryById,
};
module.exports.connection = connection;









