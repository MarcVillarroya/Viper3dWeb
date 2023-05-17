// Función para cargar las categorías al menú desplegable
async function loadCategories() {
    try {
      const response = await fetch('/category/getCategories');
      const categories = await response.json();
  
      const dropdownMenu = document.querySelector('.dropdown-menu');
  
      categories.forEach((category) => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.className = 'dropdown-item';
        link.textContent = category.name;

        link.setAttribute('data-category-name', category.name);
        link.setAttribute('data-category-id', category.id);
        link.addEventListener('click', handleCategoryClick);
  
        listItem.appendChild(link);
        dropdownMenu.appendChild(listItem);
      });
    } catch (error) {
      console.error('Error al cargar las categorías:', error);
    }
  }

  
  
  // Llama a la función loadCategories al cargar la página
  document.addEventListener('DOMContentLoaded', async () => {
    await loadCategories();
    await loadCategoryBlocks();
    const urlParams = new URLSearchParams(window.location.search);
    selectedCategoryId = urlParams.get('category');
    const page = parseInt(urlParams.get('page')) || 1;
    if (selectedCategoryId) {
      loadProductsByCategory(selectedCategoryId, page);
    }
  });
  

// Función para obtener el valor de una cookie
function getCookieValue(cookieName) {
  const cookieString = decodeURIComponent(document.cookie);
  const cookiesArray = cookieString.split(';');
  const cookieNameWithEqual = `${cookieName}=`;
  let value = ''; // Cambia 'const' a 'let'
  for (let cookie of cookiesArray) {
    cookie = cookie.trim();
    if (cookie.indexOf(cookieNameWithEqual) === 0) {
      value = cookie.substring(cookieNameWithEqual.length, cookie.length);
      break;
    }
  }
  console.log('getCookieValue', cookieName, value);
  return value;
}

// Función para manejar el clic en las categorías del menú desplegable
function handleCategoryClick(event) {
  event.preventDefault();
  const categoryId = event.target.getAttribute('data-category-id');
  
  // Comprueba si el usuario ha iniciado sesión
  const isLoggedIn = getCookieValue('isLoggedIn') === 'true';
  console.log('isLoggedIn', isLoggedIn); // Agrega este registro
  
  // Redirige a la página correspondiente según el estado de inicio de sesión
  if (isLoggedIn) {
    window.location.href = `/products_auth?category=${categoryId}&page=1`;
  } else {
    window.location.href = `/products?category=${categoryId}&page=1`;
  }
}

      let selectedCategoryId = null;

      const itemsPerPage = 12;
      // Función para cargar los productos de una categoría

      async function loadProductsByCategory(categoryId, page) {
        try {
          const category = await getCategoryInfo(categoryId);

          const titleContainer = document.querySelector('#category-title');
          titleContainer.textContent = category.name;
      
          const descriptionContainer = document.querySelector('#category-description');
          descriptionContainer.textContent = category.description;
      
          const response = await fetch(`/products/getProductsByCategory/${categoryId}`);
          const products = await response.json();
      
          const startIndex = (page - 1) * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;
          const paginatedProducts = products.slice(startIndex, endIndex);
      
          const productsContainer = document.querySelector('#product-container');
    
            productsContainer.innerHTML = '';
    
            const row = document.createElement('div');
            row.className = 'row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4';
            productsContainer.appendChild(row);
    
            paginatedProducts.forEach((product, index) => {
              const col = document.createElement("div");
              col.className =
                "col-lg-3 col-md-6 col-sm-6 animate__animated animate__fadeIn";
              col.style.animationDelay = `${index * 100}ms`; // 100 ms de retraso entre cada tarjeta

          
              const card = document.createElement('div');
              card.className = 'card product-card d-flex flex-column';
              card.style.border = '1px solid #1a237e';
              card.style.borderRadius = '10px';
              card.style.display = 'flex';
              card.style.flexDirection = 'column';
              card.style.justifyContent = 'space-between';
              
          
              card.innerHTML = `
              <div class="image-container-control" style="padding-top: 100%; position: relative; overflow: hidden;">
                <img src="/img_productos/${product.image1}" class="card-img-top thumbnail" style="border-top-left-radius: 10px; border-top-right-radius: 10px; object-fit: cover; height: 100%; width: 100%; position: absolute; top: 0; left: 0;" alt="${product.product_name}">
              </div>
            
              <div class="card-footer bg-dark text-white mt-auto" style="border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">
                <h5 class="card-title">${product.product_name}</h5>
                <p class="card-text">Precio: €${product.price.toFixed(2)}</p>
              </div>
            `;
            
            card.addEventListener('click', () => showProductModal(product.id));  

              col.appendChild(card);
              row.appendChild(col);
          });
          createPagination(products.length, itemsPerPage, page);
          
        } catch (error) {
            console.error('Error al obtener los productos por categoría:', error);
        }
    }

    function createPagination(totalItems, itemsPerPage, currentPage) {
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      const paginationContainer = document.querySelector('.pagination');
      paginationContainer.innerHTML = '';
    
      for (let i = 1; i <= totalPages; i++) {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
    
        if (i === currentPage) {
          link.className = 'active';
        }
    
        link.textContent = i;
        link.addEventListener('click', () => {
          loadProductsByCategory(selectedCategoryId, i);
        });
    
        listItem.appendChild(link);
        paginationContainer.appendChild(listItem);
      }
    }

    async function getCategoryInfo(categoryId) {
      try {
        const response = await fetch(`/category/getCategoryById/${categoryId}`);
        const category = await response.json();
        return category;
      } catch (error) {
        console.error('Error al obtener la información de la categoría:', error);
      }
    }
    
    // Función para mostrar el modal del producto
    async function showProductModal(productId) {
      

      try {
        
        const product = await fetchProductById(productId);
        console.log('Video del producto:', product.video_link);
    
        if (!product) {
          console.error(`No se pudo encontrar el producto con el ID ${productId}`);
          return;
        }
    
        const productModalLabel = document.getElementById('productModalLabel');
        productModalLabel.textContent = product.product_name;
    
        const carouselInner = document.querySelector('#productCarousel .carousel-inner');
        carouselInner.innerHTML = '';
    
        const imageUrlPrefix = '/img_productos/';
    
        let hasActiveItem = false;
    
        for (let i = 1; i <= 5; i++) {
          if (product[`image${i}`]) {
            const carouselItem = document.createElement('div');
            carouselItem.className = `carousel-item${hasActiveItem ? '' : ' active'}`;
    
            const img = document.createElement('img');
            img.src = imageUrlPrefix + product[`image${i}`];
            img.className = 'd-block w-100';
            img.alt = `Imagen ${i} del producto ${product.product_name}`;
    
            carouselItem.appendChild(img);
            carouselInner.appendChild(carouselItem);
    
            hasActiveItem = true;
          }
        }
    
        if (product.video_link) {
          const carouselItem = document.createElement('div');
          carouselItem.className = `carousel-item${hasActiveItem ? '' : ' active'}`;
    
          const video = document.createElement('video');
          const productVideoId = 'product-video';
          video.id = productVideoId;
          video.className = 'video-js vjs-default-skin d-block w-100';
          video.setAttribute('data-setup', '{}');
          video.controls = true;
          video.setAttribute('src', `/video_productos/${product.video_link}`);


    
          carouselItem.appendChild(video);
          carouselInner.appendChild(carouselItem);
        }
    
        const productInfo = document.getElementById('productInfo');
        productInfo.innerHTML = `
        <hr>
        <div class="d-flex justify-content-between align-items-center">
          <h5><strong>Precio:</strong> €${product.price.toFixed(2)}</h5>
          <a href="${product.purchase_link}" class="btn btn-outline-success" target="_blank">Compralo en ETSY!</a>
        </div>
        <hr>
        <h5><strong>Descripción:</strong></h5>
        <p>${product.product_description}</p>
        `;
    
        const productModal = new bootstrap.Modal(document.querySelector('#productModal'));
        productModal.show();
    
        // Agrega este controlador de eventos para inicializar Video.js cuando el modal esté completamente visible
        document.querySelector('#productModal').addEventListener('shown.bs.modal', () => {
        });
    
      } catch (error) {
        console.error('Error al obtener el producto por ID:', error);
      }
    }

    async function fetchProductById(productId) {
      try {
        const response = await fetch(`/product/getProductById/${productId}`);
        return response.json();
      } catch (error) {
        console.error('Error al obtener el producto por ID:', error);
      }
    }
    document.addEventListener('DOMContentLoaded', () => {
      const carouselElement = document.querySelector('#productCarousel');
      new bootstrap.Carousel(carouselElement, {
        interval: false, // Esto deshabilita el cambio automático de diapositivas
      });
    });


    async function loadCategoryBlocks() {
      try {
        const response = await fetch('/category/getCategories');
        const categories = await response.json();
    
        const blocksContainer = document.querySelector('.category-blocks');
        
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const block = entry.target;
              block.classList.add('animating'); // Añade la clase "animating"
              block.style.opacity = '0';
              block.style.transform = 'translateY(-50px)';
              block.style.transition = 'opacity 0.5s, transform 0.5s';
              
              setTimeout(() => {
                block.style.opacity = '1';
                block.style.transform = 'translateY(0)';
              }, 300); // Retraso de 100ms para cada bloque
              
              observer.unobserve(block); // Dejar de observar el bloque después de la animación
            }
          });
        });
        
        categories.forEach((category, index) => {
          const block = document.createElement('div');
          block.className = 'category-block';
    
          // Alternar entre clases para diferentes colores de fondo
          if (index % 2 === 0) {
            block.className += ' bg-blue';
          } else {
            block.className += ' bg-grey';
          }
    
          block.textContent = category.name;
    
          block.setAttribute('data-category-id', category.id);
          block.addEventListener('click', handleCategoryClick);
    
          blocksContainer.appendChild(block);
          
          observer.observe(block); // Observar cada bloque agregado al contenedor
          block.addEventListener('transitionend', () => {
            block.classList.remove('animating'); // Elimina la clase "animating" cuando la transición haya terminado
          });
        });
      } catch (error) {
        console.error('Error al cargar los bloques de categorías:', error);
      }
    }
    
    
    
     
    
    
    
    