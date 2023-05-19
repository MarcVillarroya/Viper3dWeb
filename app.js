// Importar las dependencias necesarias
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const path = require('path');
const cookieParser = require('cookie-parser');

require('dotenv').config();

// Crear una instancia de Express
const app = express();

// Usar cookie-parser como middleware
app.use(cookieParser());

// Configurar el motor de plantillas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configurar el middleware bodyParser para manejar datos POST
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));
app.use('/img_productos', express.static(path.join(__dirname, 'public', 'img_productos')));

// Importar y usar los routers
const dbTestRoutes = require('./routes/dbTestRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/CategoryRoutes');
const { productRouter, authProductRouter } = require('./routes/ProductRoutes'); // Modifica esta línea

app.use('/db', dbTestRoutes);
app.use('/', userRoutes);
app.use('/category', categoryRoutes);
app.use('/product', productRouter); // Modifica esta línea
app.use('/products', productRouter); // Modifica esta línea
app.use('/products_auth', authProductRouter); // Sin cambios

app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/contact', (req, res) => {
  res.render('contact');
});


// Iniciar el servidor en el puerto 3000
app.listen(3000, () => {
  console.log('Servidor corriendo en el puerto 3000');
});










