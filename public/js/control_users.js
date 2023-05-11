// Esta función recibe el ID de usuario como parámetro y envía una petición DELETE a la API para eliminar al usuario
async function deleteUser(userId) {
    try {
      const response = await fetch(`/deleteUser/${userId}`, {
        method: 'DELETE', // El método de la petición es DELETE
      });
  
      if (response.ok) { // Si la respuesta es satisfactoria (status code 200-299)
        console.log('Usuario eliminado con éxito'); // Imprime mensaje en consola indicando éxito
        fetchUsers(); // Actualiza la lista de usuarios en la tabla
      } else {
        console.error('Error al eliminar el usuario'); // Si no, imprime mensaje en consola indicando error
      }
    } catch (error) { // Si ocurre un error, imprime mensaje en consola con el error
      console.error('Error al eliminar el usuario:', error);
    }
  }
  
  // Esta función recibe un nombre y una longitud máxima permitida y devuelve el nombre truncado si excede la longitud máxima
  function truncateName(name, maxLength) {
    if (name.length > maxLength) { // Si la longitud del nombre es mayor que la longitud máxima permitida
      return name.slice(0, maxLength) + '…'; // Devuelve el nombre truncado con tres puntos suspensivos al final
    }
    return name; // Si no, devuelve el nombre sin cambios
  }
  
  // Esta función recibe una cadena de texto que representa una fecha en formato ISO y devuelve la fecha formateada como una cadena de texto sin la letra "T"
  function formatDate(dateString) {
    const date = new Date(dateString); // Crea un objeto Date a partir de la cadena de texto
    return date.toISOString().replace('T', ' ').substring(0, 19); // Devuelve la fecha formateada sin la letra "T"
  }
  
  // Esta función hace una petición GET a la API para obtener la lista de usuarios y actualizar la tabla en el HTML
  async function fetchUsers() {
    try {
      const response = await fetch('/getUsers'); // Hace una petición GET a la ruta "/getUsers" de la API
      const users = await response.json(); // Convierte la respuesta en una lista de usuarios
  
      const tableBody = document.querySelector('.table tbody'); // Obtiene la tabla en el HTML
      tableBody.innerHTML = ''; // Elimina todos los elementos tr de la tabla
  
      // Agrega un elemento tr para cada usuario en la lista de usuarios
      users.forEach((user) => {
        const row = document.createElement('tr'); // Crea un nuevo elemento tr
        const maxLength = 30; // Longitud máxima permitida para el nombre de usuario
        const truncatedUsername = truncateName(user.username, maxLength); // Trunca el nombre de usuario si excede la longitud máxima permitida
        const formattedDate = formatDate(user.registration_date); // Formatea la fecha de registro del usuario
  
        // Agrega las celdas de la fila con los datos del usuario y un botón para eliminar al usuario
        row.innerHTML = `
          <td>${user.id}</td>
          <td>${truncatedUsername}</td>
          <td>${user.email}</td>
          <td>${user.country}</td>
          <td>${user.password}</td>
          <td>${formattedDate}</td>
          <td>${user.is_admin ? 'Admin' : 'Usuario'}</td>
          <td><button class="delete-button" style="background-color: red; color: white;">Eliminar</button></td>
        `;
  
        tableBody.appendChild(row);
        row.querySelector('.delete-button').addEventListener('click', () => deleteUser(user.id));
      });
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
    }
  }