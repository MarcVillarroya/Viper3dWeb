// Importar las dependencias necesarias
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const util = require('util');

dotenv.config();

// Configurar la conexión a la base de datos
const connectionConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

// Crear la conexión a la base de datos
let connection;

async function initializeConnection() {
  connection = await mysql.createConnection(connectionConfig);
  console.log('Connected to the database as ID:', connection.threadId);
  createProductsTable();
}

initializeConnection().catch(err => {
  console.error('Error connecting to the database:', err.stack);
});

// Crear la tabla 'products' si no existe
async function createProductsTable() {
  const createTableQuery = `
  CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    product_description TEXT,
    image1 VARCHAR(255),
    image2 VARCHAR(255),
    image3 VARCHAR(255),
    image4 VARCHAR(255),
    image5 VARCHAR(255),
    video_link VARCHAR(255),
    price DECIMAL(10, 2) NOT NULL,
    purchase_link VARCHAR(255),
    category_id INT,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );
  `;

  try {
    await connection.query(createTableQuery);
    console.log('Tabla de productos creada con éxito');
  } catch (err) {
    console.error('Error al crear la tabla de productos:', err.stack);
  }
}



// Obtener productos
async function getProducts() {
  const queryText = 'SELECT * FROM products';
  const [rows] = await connection.query(queryText);
  return rows;
}

// Crear un nuevo producto
async function createProduct(product_name, product_description, image1, image2, image3, image4, image5, video_link, price, purchase_link, category_id) {
  const queryText = 'INSERT INTO products (product_name, product_description, image1, image2, image3, image4, image5, video_link, price, purchase_link, category_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  const args = [product_name, product_description, image1, image2, image3, image4, image5, video_link, price, purchase_link, category_id];

  await connection.query(queryText, args);

  return {
    product_name,
    product_description,
    image1,
    image2,
    image3,
    image4,
    image5,
    video_link,
    price,
    purchase_link,
    category_id,
  };
}

// Eliminar un producto
async function deleteProduct(id) {
  const queryText = 'DELETE FROM products WHERE id = ?';
  const args = [id];

  await connection.query(queryText, args);
}

// Actualizar un producto
async function updateProduct(id, product_name, product_description, image1, image2, image3, image4, image5, video_link, price, purchase_link, category_id) {
  const queryText = 'UPDATE products SET product_name = ?, product_description = ?, image1 = ?, image2 = ?, image3 = ?, image4 = ?, image5 = ?, video_link = ?, price = ?, purchase_link = ?, category_id = ? WHERE id = ?';
  const args = [
    product_name,
    product_description,
    image1,
    image2,
    image3,
    image4,
    image5,
    video_link,
    price,
    purchase_link,
    category_id,
    id,
  ];

  await connection.query(queryText, args);
}

async function getProductsByCategory(categoryId) {
  const queryText = 'SELECT * FROM products WHERE category_id = ?';
  const [rows] = await connection.query(queryText, [categoryId]);
  return rows;
}

// getProductById function
async function getProductById(id) {
  const queryText = 'SELECT * FROM products WHERE id = ?';
  const [rows] = await connection.query(queryText, [id]);

  if (rows.length === 0) {
    throw new Error(`No se encontró el producto con el id ${id}`);
  }

  return rows[0];
}

// Exportar las funciones para ser utilizadas en otros archivos
module.exports = {
  createProductsTable,
  getProducts,
  createProduct,
  deleteProduct,
  updateProduct,
  getProductsByCategory,
  getProductById,
};
module.exports.connection = connection;

