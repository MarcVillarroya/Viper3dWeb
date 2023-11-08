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
    await pool.execute(createTableQuery);
    console.log('Tabla de productos creada con éxito');
  } catch (err) {
    console.error('Error al crear la tabla de productos:', err.stack);
  }
}

// Obtener todos los productos
async function getProducts() {
  const queryText = 'SELECT * FROM products';
  const [rows] = await pool.execute(queryText);
  return rows;
}

async function createProduct(product_name, product_description, image1 = null, image2 = null, image3 = null, image4 = null, image5 = null, video_link = null, price, purchase_link, category_id) {
  const queryText = 'INSERT INTO products (product_name, product_description, image1, image2, image3, image4, image5, video_link, price, purchase_link, category_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  const args = [product_name, product_description, image1, image2, image3, image4, image5, video_link, price, purchase_link, category_id];

  await pool.execute(queryText, args);

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
  await pool.execute(queryText, [id]);
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

  await pool.execute(queryText, args);
}

// Obtener productos por categoría
async function getProductsByCategory(categoryId) {
  const queryText = 'SELECT * FROM products WHERE category_id = ?';
  const [rows] = await pool.execute(queryText, [categoryId]);
  return rows;
}

// Obtener un producto por su ID
async function getProductById(id) {
  const queryText = 'SELECT * FROM products WHERE id = ?';
  const [rows] = await pool.execute(queryText, [id]);

  if (rows.length === 0) {
    throw new Error(`No se encontró el producto con el id ${id}`);
  }

  return rows[0];
}

// Exportar las funciones
module.exports = {
  createProductsTable,
  getProducts,
  createProduct,
  deleteProduct,
  updateProduct,
  getProductsByCategory,
  getProductById,
};

// Crear la tabla 'products' al iniciar el módulo
createProductsTable();

