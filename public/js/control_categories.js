// Esta función maneja el evento submit del formulario de creación de categorías y envía una petición POST a la API
document.getElementById('newCategoryForm').addEventListener('submit', async (event) => {
  event.preventDefault(); // Evita que el formulario se envíe automáticamente

  // Obtiene los valores de los campos del formulario
  const name = document.getElementById('categoryName').value;
  const description = document.getElementById('categoryDescription').value;

  // Envía una petición POST a la ruta "/category/create" de la API con los valores del formulario en formato JSON en el cuerpo
  const response = await fetch('/category/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, description }),
  });

  if (response.ok) { // Si la respuesta es satisfactoria (status code 200-299)
    // Convierte la respuesta en un objeto categoría y agrega la categoría a la tabla de categorías
    const category = await response.json();
    addToCategoriesTable(category);

    // Cierra el modal y limpia los campos del formulario
    const categoryModal = bootstrap.Modal.getInstance(document.getElementById('newCategoryModal'));
    categoryModal.hide();
    document.getElementById('categoryName').value = '';
    document.getElementById('categoryDescription').value = '';

    fetchCategories(); // Actualiza la lista de categorías en la tabla
    row.addEventListener('click', () => fetchProductsByCategory(category.id));

  } else {
    // Muestra un mensaje de error si no se pudo crear la categoría
    const error = await response.text();
    alert(`Error al crear la categoría: ${error}`);
  }
});

function addToCategoriesTable(category) {
  const categoriesTable = document.getElementById('categoriesTableBody');
  const newRow = categoriesTable.insertRow(-1);

  const idCell = newRow.insertCell(0);
  idCell.textContent = category.id;

  const nameCell = newRow.insertCell(1);
  nameCell.textContent = category.name;

  const descriptionCell = newRow.insertCell(2);
  descriptionCell.textContent = category.description;
}

async function deleteCategory(categoryId) {
  try {
    await fetch(`/category/delete/${categoryId}`, {
      method: 'DELETE',
    });

    // Encuentra el elemento de la tabla de categorías con el atributo data-category-id
    const categoryRow = document.querySelector(`[data-category-id="${categoryId}"]`);
    if (categoryRow) {
      // Elimina la fila de la tabla de categorías
      categoryRow.remove();
    } else {
      console.error(`No se pudo encontrar la fila de la tabla de categorías con el ID ${categoryId}`);
    }
  } catch (error) {
    console.error('Error al eliminar la categoría:', error);
  }
}

function openEditCategoryModal(categoryId, categories) {
  // Encuentra la categoría con el ID especificado
  const category = categories.find((cat) => cat.id === categoryId);

  if (!category) {
    console.error(`No se pudo encontrar la categoría con el ID ${categoryId}`);
    return;
  }

  // Rellena los campos del formulario con la información de la categoría actual
  document.querySelector('#editCategoryForm #editCategoryName').value = category.name;
  document.querySelector('#editCategoryForm #editCategoryDescription').value = category.description;
  document.querySelector('#editCategoryForm #editCategoryId').value = category.id;

  // Muestra el modal
  const editCategoryModal = new bootstrap.Modal(document.querySelector('#editCategoryModal'));
  editCategoryModal.show();
}

document.querySelector('#editCategoryForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const categoryId = document.querySelector('#editCategoryForm #editCategoryId').value;
  const categoryName = document.querySelector('#editCategoryForm #editCategoryName').value;
  const categoryDescription = document.querySelector('#editCategoryForm #editCategoryDescription').value;

  try {
    await updateCategory(categoryId, categoryName, categoryDescription);

    // Cierra el modal de edición de categorías
    const editCategoryModal = bootstrap.Modal.getInstance(document.querySelector('#editCategoryModal'));
    editCategoryModal.hide();

    // Actualiza la tabla de categorías para reflejar los cambios
    fetchCategories();
  } catch (error) {
    console.error('Error al actualizar la categoría:', error);
  }
});

async function updateCategory(categoryId, categoryName, categoryDescription) {
  await fetch(`/category/update/${categoryId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: categoryName,
      description: categoryDescription,
    }),
  });
}

// Esta función hace una petición GET a la API para obtener la lista de categorías y actualizar la tabla en el HTML
async function fetchCategories() {
  try {
    const response = await fetch('/category/getCategories');
    const categories = await response.json();

    const tableBody = document.querySelector('#categories-content .table tbody');
    tableBody.innerHTML = '';

    categories.forEach((category) => {
      const row = document.createElement('tr');
      row.setAttribute('data-category-id', category.id);

      row.innerHTML = `
        <td>${category.id}</td>
        <td>${category.name}</td>
        <td>${category.description}</td>
        <td>
          <button class="edit-category-button" style="background-color: blue; color: white;">Editar</button>
          <button class="delete-category-button" style="background-color: red; color: white;">Eliminar</button>
        </td>
      `;

      tableBody.appendChild(row);

      row.addEventListener('click', () => {
        // Ocultar contenido de categorías y usuarios
        document.getElementById('categories-content').style.display = 'none';
        document.getElementById('users-content').style.display = 'none';

        // Mostrar contenido de productos
        document.getElementById('products-content').style.display = 'block';
        // Establecer el valor del campo oculto 'categoryId' al 'id' de la categoría seleccionada
        document.getElementById('categoryId').value = category.id;
        // Llamar a la función para obtener y mostrar productos de la categoría seleccionada
        currentCategoryId = category.id;
        fetchProductsByCategory(currentCategoryId);
      });

      row.querySelector('.delete-category-button').addEventListener('click', (event) => {
        event.stopPropagation(); // Detiene la propagación del evento de clic
        deleteCategory(category.id);
      });

      row.querySelector('.edit-category-button').addEventListener('click', (event) => {
        event.stopPropagation(); // Detiene la propagación del evento de clic
        openEditCategoryModal(category.id, categories);
      });

    });
  } catch (error) {
    console.error('Error al obtener las categorías:', error);
  }
}


let currentCategoryId = null;






