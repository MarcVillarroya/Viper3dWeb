function createRemoveButton(parent, input) {
  const removeButton = document.createElement('button');
  removeButton.textContent = 'Eliminar';
  removeButton.className = 'btn btn-sm btn-danger ms-2';
  removeButton.addEventListener('click', function () {
    parent.remove();
    input.value = null;
  });
  return removeButton;
}

function addImagePreviewListener(imageInputId, imagePreviewContainerId) {
    document.getElementById(imageInputId).addEventListener('change', function (event) {
      const input = event.target;
      const previewContainer = document.getElementById(imagePreviewContainerId);
      previewContainer.innerHTML = '';
  
      for (const file of input.files) {
        const reader = new FileReader();
        reader.onload = function (e) {
          const imgWrapper = document.createElement('div');
          imgWrapper.className = 'd-inline-block me-2 position-relative';
  
          const img = document.createElement('img');
          img.src = e.target.result;
          img.width = 100;
          img.height = 100;
          img.className = 'me-2';
  
          const removeButton = createRemoveButton(imgWrapper, input);
  
          imgWrapper.appendChild(img);
          imgWrapper.appendChild(removeButton);
          previewContainer.appendChild(imgWrapper);
        };
        reader.readAsDataURL(file);
      }
    });
  }
  
  // Agregar listeners a los campos de imagen y contenedores de vista previa
  addImagePreviewListener('images1', 'imagePreviews1');
  addImagePreviewListener('images2', 'imagePreviews2');
  addImagePreviewListener('images3', 'imagePreviews3');
  addImagePreviewListener('images4', 'imagePreviews4');
  addImagePreviewListener('images5', 'imagePreviews5');
  

document.getElementById('video').addEventListener('change', function (event) {
  const input = event.target;
  const previewContainer = document.getElementById('videoPreview');
  previewContainer.innerHTML = '';

  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = function (e) {
    const videoWrapper = document.createElement('div');
    videoWrapper.className = 'd-inline-block me-2 position-relative';

    const video = document.createElement('video');
    video.src = e.target.result;
    video.width = 200;
    video.height = 150;
    video.controls = true;

    const removeButton = createRemoveButton(videoWrapper, input);

    videoWrapper.appendChild(video);
    videoWrapper.appendChild(removeButton);
    previewContainer.appendChild(videoWrapper);
  };
  reader.readAsDataURL(file);
});

// Selecciona el botón de envío y el formulario
const submitProductBtn = document.getElementById('submitProductBtn');
const newProductForm = document.getElementById('newProductForm');



// Agrega un event listener al botón de envío para prevenir el comportamiento predeterminado del formulario y realizar la solicitud POST
submitProductBtn.addEventListener('click', async (event) => {
  event.preventDefault();

  // Crea un objeto FormData a partir del formulario
  const formData = new FormData(newProductForm);

  try {
    // Realiza la solicitud POST usando la API Fetch
    const response = await fetch('/product/create', {
      method: 'POST',
      body: formData,
    });

    // Comprueba si la solicitud tuvo éxito
    if (response.ok) {
      const newProduct = await response.json();
      console.log('Producto creado con éxito:', newProduct);

      // Aquí puedes actualizar la UI, mostrar un mensaje de éxito, etc.
      // ...

      // Cierra el modal

      const modalElement = document.getElementById('newProductModal');
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      modalInstance.hide();
      fetchProductsByCategory(currentCategoryId);
      
    } else {
      // Si la respuesta no es exitosa, lanza un error
      throw new Error(`Error al crear el producto: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error al crear el producto:', error);

    // Aquí puedes mostrar un mensaje de error en la UI si es necesario
    // ...
  }
});


async function deleteProduct(productId) {
  try {
    const response = await fetch(`/product/delete/${productId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      console.log('Producto eliminado con éxito');
      fetchProductsByCategory(currentCategoryId);
    } else {
      throw new Error(`Error al eliminar el producto: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
  }
}

async function fetchProductsByCategory(categoryId) {
  try {
    const response = await fetch(`/product/getProductsByCategory/${categoryId}`);
    const products = await response.json();

    const productsContainer = document.querySelector('#products-content .products-container');
    productsContainer.innerHTML = '';

    const row = document.createElement('div');
    row.className = 'row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-6 g-4';
    productsContainer.appendChild(row);

    products.forEach((product, index) => {
      const col = document.createElement('div');
    col.className = 'col';

    const card = document.createElement('div');
    card.className = 'card h-100 product-card animate__animated animate__fadeIn'; // Añade las clases de animación aquí
    card.style.animationDelay = `${index * 100}ms`; // Añade el retraso en la animación aquí

      card.innerHTML = `
        <div class="image-container-control mt-3">
          <img src="/img_productos/${product.image1}" class="card-img-top thumbnail" alt="${product.product_name}">
        </div>

        <div class="card-body">
          <h5 class="card-title">${product.product_name}</h5>
          <p class="card-text">Precio: $${product.price}</p>
          <button type="button" class="btn btn-danger delete-product-btn" data-product-id="${product.id}">Eliminar</button>
          <button type="button" class="btn btn-primary edit-product-btn" data-product-id="${product.id}">Editar</button>
        </div>
      `;


      col.appendChild(card);
      row.appendChild(col);
      
      const deleteProductBtn = col.querySelector('.delete-product-btn');
      deleteProductBtn.addEventListener('click', () => {
        const productId = deleteProductBtn.getAttribute('data-product-id');
        deleteProduct(productId);
      });

      const editProductBtn = col.querySelector('.edit-product-btn');
      editProductBtn.addEventListener('click', () => {
        const productId = editProductBtn.getAttribute('data-product-id');
        openEditProductModal(productId);
      });
    });
  } catch (error) {
    console.error('Error al obtener los productos por categoría:', error);
  }
}

function openEditProductModal(productId) {
  fetchProductById(productId)
    .then((product) => {
      if (!product) {
        console.error(`No se pudo encontrar el producto con el ID ${productId}`);
        return;
      }

      // Rellena los campos del formulario con la información del producto actual
      document.querySelector('#editProductForm #editProductId').value = product.id;
      document.querySelector('#editProductForm #productName').value = product.product_name;
      document.querySelector('#editProductForm #productDescription').value = product.product_description;
      document.querySelector('#editProductForm #price').value = product.price;
      document.querySelector('#editProductForm #purchaseLink').value = product.purchase_link;
      document.querySelector('#editProductForm #categoryId').value = product.category_id;

       // Agrega las vistas previas de las imágenes y el video existentes al modal de edición
       const imageUrlPrefix = '/img_productos/';
       const videoUrlPrefix = '/video_productos/';
 
       for (let i = 1; i <= 5; i++) {
         if (product[`image${i}`]) {
           addPreviewToEditModal('image', imageUrlPrefix + product[`image${i}`], `editImages${i}`, `editImagePreviews${i}`);
         }
       }
 
       if (product.video) {
         addPreviewToEditModal('video', videoUrlPrefix + product.video, 'editVideo', 'editVideoPreview');
       }
 

      // Muestra el modal
      const editProductModal = new bootstrap.Modal(document.querySelector('#editProductModal'));
      editProductModal.show();
    })
    .catch((error) => {
      console.error('Error al obtener el producto por ID:', error);
    });
}

async function fetchProductById(productId) {
  const response = await fetch(`/product/getProductById/${productId}`);
  return response.json();
}


async function updateProduct(productId, productName, productDescription, price, purchaseLink, categoryId, images, video) {
  const formData = new FormData();
  formData.append('product_name', productName);
  formData.append('product_description', productDescription);
  formData.append('price', price);
  formData.append('purchase_link', purchaseLink);
  formData.append('category_id', categoryId);

  for (let i = 0; i < images.length; i++) {
    if (images[i]) {
      formData.append('images[]', images[i]);
    }
  }
  
  

  if (video) {
    formData.append('video', video);
  }

  await fetch(`/product/update/${productId}`, {
    method: 'PUT',
    body: formData,
  });
}


document.querySelector('#editProductForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const productId = document.querySelector('#editProductForm #editProductId').value;
  const productName = document.querySelector('#editProductForm #productName').value;
  const productDescription = document.querySelector('#editProductForm #productDescription').value;
  const price = document.querySelector('#editProductForm #price').value;
  const purchaseLink = document.querySelector('#editProductForm #purchaseLink').value;
  const categoryId = document.querySelector('#editProductForm #categoryId').value;

  const images = [];
  for (let i = 1; i <= 5; i++) {
    const imageInput = document.getElementById(`editImages${i}`);
    if (imageInput.files[0]) {
      images.push(imageInput.files[0]);
    } else {
      images.push(null);
    }
  }

  const videoInput = document.getElementById('editVideo');
  const video = videoInput.files[0] || null;

  try {
    await updateProduct(productId, productName, productDescription, price, purchaseLink, categoryId, images, video);

    // Cierra el modal de edición de productos
    const editProductModal = bootstrap.Modal.getInstance(document.querySelector('#editProductModal'));
    editProductModal.hide();

    // Actualiza la lista de productos para reflejar los cambios
    fetchProductsByCategory(currentCategoryId);
  } catch (error) {
    console.error('Error al actualizar el producto:', error);
  }
});

// ... Resto del código ...


// Agregar listeners a los campos de imagen y contenedores de vista previa en el modal de edición
for (let i = 1; i <= 5; i++) {
  addImagePreviewListener(`editImages${i}`, `editImagePreviews${i}`);
}

document.getElementById('editVideo').addEventListener('change', function (event) {
  const input = event.target;
  const previewContainer = document.getElementById('editVideoPreview');
  previewContainer.innerHTML = '';

  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = function (e) {
    const videoWrapper = document.createElement('div');
    videoWrapper.className = 'd-inline-block me-2 position-relative';

    const video = document.createElement('video');
    video.src = e.target.result;
    video.width = 200;
    video.height = 150;
    video.controls = true;

    const removeButton = createRemoveButton(videoWrapper, input);

    videoWrapper.appendChild(video);
    videoWrapper.appendChild(removeButton);
    previewContainer.appendChild(videoWrapper);
  };
  reader.readAsDataURL(file);
});
function addPreviewToEditModal(type, url, inputId, previewId) {
  const input = document.getElementById(inputId);
  const previewContainer = document.getElementById(previewId);
  previewContainer.innerHTML = '';

  if (type === 'image') {
    const img = document.createElement('img');
    img.src = url;
    img.width = 200;
    img.height = 150;
    img.className = 'img-thumbnail me-2';
    previewContainer.appendChild(img);
  } else if (type === 'video') {
    const video = document.createElement('video');
    video.src = url;
    video.width = 200;
    video.height = 150;
    video.controls = true;
    video.className = 'me-2';
    previewContainer.appendChild(video);
  }
  
}



$(document).ready(function() {
  // Suponiendo que ya existe una variable "currentCategoryId" que contiene el ID de la categoría actual
  fetchProductsByCategory(currentCategoryId);
});




