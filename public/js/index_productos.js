// Escucha el evento de carga del documento y carga las categorías y productos más recientes
document.addEventListener('DOMContentLoaded', async () => {
  await loadCategoryBlocks();
  await loadLatestProducts();

  const urlParams = new URLSearchParams(window.location.search);
  const selectedCategoryId = urlParams.get('category');
  const page = parseInt(urlParams.get('page'), 10) || 1;

  if (selectedCategoryId) {
    loadProductsByCategory(selectedCategoryId, page);
  }
});

// Retorna el valor de una cookie especificada
function getCookieValue(cookieName) {
  const cookieString = decodeURIComponent(document.cookie);
  const cookiesArray = cookieString.split(';');
  const cookieNameWithEqual = `${cookieName}=`;

  for (const cookie of cookiesArray) {
    const trimmedCookie = cookie.trim();
    if (trimmedCookie.startsWith(cookieNameWithEqual)) {
      const value = trimmedCookie.substring(cookieNameWithEqual.length);
      console.log('getCookieValue', cookieName, value);
      return value;
    }
  }
  return '';
}

// Maneja el clic en las categorías del menú desplegable
function handleCategoryClick(event) {
  event.preventDefault();
  const categoryId = event.target.getAttribute('data-category-id');
  const isLoggedIn = getCookieValue('isLoggedIn') === 'true';
  console.log('isLoggedIn', isLoggedIn);

  const url = isLoggedIn ? '/products_auth' : '/products';
  const params = new URLSearchParams({ category: categoryId, page: 1 });
  window.location.href = `${url}?${params}`;
}

// Obtiene información de una categoría basada en su ID
async function getCategoryInfo(categoryId) {
  try {
    const response = await fetch(`/category/getCategoryById/${categoryId}`);
    return response.json();
  } catch (error) {
    console.error('Error al obtener la información de la categoría:', error);
  }
}

// Obtiene un producto basado en su ID
async function fetchProductById(productId) {
  try {
    const response = await fetch(`/product/getProductById/${productId}`);
    return response.json();
  } catch (error) {
    console.error('Error al obtener el producto por ID:', error);
  }
}

// Carga los bloques de categorías en la página
async function loadCategoryBlocks() {
  try {
    const response = await fetch('/category/getCategories');
    const categories = await response.json();
    const blocksContainer = document.querySelector('#categorias'); 

    categories.forEach((category, index) => {
      const block = document.createElement('div');
      block.className = `category-block ${index % 2 === 0 ? 'bg-blue' : 'bg-grey'}`;
      block.textContent = category.name;
      block.setAttribute('data-category-id', category.id);
      block.addEventListener('click', handleCategoryClick);
      blocksContainer.appendChild(block);
    });
    
  } catch (error) {
    console.error('Error al cargar los bloques de categorías:', error);
  }
}

// Carga los productos más recientes en la página
async function loadLatestProducts() {
  try {
    const response = await fetch('products/getProducts');
    const products = await response.json();

    const latestProducts = products.slice(-4);
    const productsContainer = document.querySelector('#novedades');
    productsContainer.innerHTML = '';

    const row = document.createElement('div');
    row.className = 'row';

    latestProducts.forEach((product) => {
      const col = document.createElement('div');
      col.className = 'col-lg-3 col-md-3 col-6';
      
      const productCard = document.createElement('div');
      productCard.className = 'card product-card d-flex flex-column';
      productCard.style.borderRadius = '10px';
      productCard.innerHTML = `
        <div class="image-container-control" style="padding-top: 100%; position: relative; overflow: hidden;">
          <img src="/img_productos/${product.image1}" class="card-img-top thumbnail" style="border-top-left-radius: 10px; border-top-right-radius: 10px; object-fit: cover; height: 100%; width: 100%; position: absolute; top: 0; left: 0;" alt="${product.product_name}">
        </div>
        <div class="card-footer bg-dark text-white mt-auto" style="border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">
          <h5 class="card-title card-title-one-line">${product.product_name}</h5>
          <p class="card-text">€${Number(product.price).toFixed(2)}</p>
        </div>
      `;
      col.appendChild(productCard);
      row.appendChild(col);
    });

    productsContainer.appendChild(row);
    
  } catch (error) {
    console.error('Error al cargar los productos más recientes:', error);
  }
}











