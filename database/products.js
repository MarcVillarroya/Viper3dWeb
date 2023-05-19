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
  dbport: process.env.DB_PORT,
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
    await connection.execute(createTableQuery);
    console.log('Tabla de productos creada con éxito');
  } catch (err) {
    console.error('Error al crear la tabla de productos:', err.stack);
    return;
  }
}

// Obtener todos los productos
async function getProducts() {
  const queryText = 'SELECT * FROM products';
  const [rows] = await connection.execute(queryText);
  return rows;
}

// Crear un nuevo producto
async function createProduct(product_name, product_description, image1, image2, image3, image4, image5, video_link, price, purchase_link, category_id) {
  const queryText = 'INSERT INTO products (product_name, product_description, image1, image2, image3, image4, image5, video_link, price, purchase_link, category_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  const args = [product_name, product_description, image1, image2, image3, image4, image5, video_link, price, purchase_link, category_id];

  await connection.execute(queryText, args);

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
  await connection.execute(queryText, [id]);
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

  await connection.execute(queryText, args);
}

// Obtener productos por categoría
async function getProductsByCategory(categoryId) {
  const queryText = 'SELECT * FROM products WHERE category_id = ?';
  const [rows] = await connection.execute(queryText, [categoryId]);
  return rows;
}

// Obtener un producto por su ID
async function getProductById(id) {
  const queryText = 'SELECT * FROM products WHERE id = ?';
  const [rows] = await connection.execute(queryText, [id]);

  if (rows.length === 0) {
    throw new Error(`No se encontró el producto con el id ${id}`);
  }

  return rows[0];
}

module.exports = {
  createConnection,
  createProductsTable,
  getProducts,
  createProduct,
  deleteProduct,
  updateProduct,
  getProductsByCategory,
  getProductById,
};

// Finalmente, iniciar la conexión a la base de datos.
createConnection().then(createProductsTable);
