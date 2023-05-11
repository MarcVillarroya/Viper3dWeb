function showContent(section) {
  // Obtener las secciones de contenido
  const usersContent = document.getElementById('users-content');
  const categoriesContent = document.getElementById('categories-content');
  const productsContent = document.getElementById('products-content');

  // Ocultar todas las secciones
  usersContent.style.display = 'none';
  categoriesContent.style.display = 'none';
  productsContent.style.display = 'none';

  if (section === 'users') {
    usersContent.style.display = 'block';
    fetchUsers(); // Obtener la lista de usuarios
  } else if (section === 'categories') {
    categoriesContent.style.display = 'block';
    fetchCategories(); // Obtener la lista de categorías
  } else if (section === 'products') {
    productsContent.style.display = 'block';
    // La función fetchProductsByCategory será llamada al hacer clic en una fila de categoría
  }
}


// Escuchar el evento de clic en el enlace de "Usuarios"
document.querySelector('a[href="control_users"]').addEventListener('click', (event) => {
  event.preventDefault();
  // Mostrar la sección de usuarios
  showContent('users');
});

// Escuchar el evento de clic en el enlace de "Productos"
document.querySelector('a[href="control_menu"]').addEventListener('click', (event) => {
  event.preventDefault();
  // Mostrar la sección de productos
  showContent('categories');
});

// Llama a la función showContent con el argumento 'users' cuando se carga la página
document.addEventListener('DOMContentLoaded', () => showContent('users'));




  
  
  