document.addEventListener('DOMContentLoaded', function () {
  // Mostrar el modal de inicio de sesión al hacer clic en el indicador LED
  const ledIndicator = document.getElementById('led-indicator');
  const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
  ledIndicator.addEventListener('click', () => loginModal.show());

  // Cambiar entre formulario de inicio de sesión y registro
  document.getElementById("show-register-modal").addEventListener("click", toggleForms);
  document.getElementById("show-login-modal").addEventListener("click", toggleForms);

  function toggleForms() {
    const isLoginFormActive = document.getElementById("login-form").style.display === "block";
    document.getElementById("login-form").style.display = isLoginFormActive ? "none" : "block";
    document.getElementById("register-form").style.display = isLoginFormActive ? "block" : "none";
    document.getElementById("loginModalLabel").textContent = isLoginFormActive ? "Registrarse" : "Iniciar sesión";
  }
});

// Función para validar el correo electrónico
function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

// Función para validar la contraseña
function validatePassword(password) {
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])?[a-zA-Z\d!@#$%^&*]{8,}$/;
  return re.test(password);
}

// Función para evitar la inyección de código
function sanitizeString(str) {
  return str.replace(/[&<>"'`=\/]/g, function(s) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '`': '&#x60;',
      '=': '&#x3D;',
      '/': '&#x2F;'
    }[s];
  });
}

// Configurar eventos de validación y envío del formulario de inicio de sesión
setupLoginFormValidation();

function setupLoginFormValidation() {
  document.getElementById("exampleInputEmail1").addEventListener("blur", validateLoginFormEmail);
  document.getElementById("exampleInputPassword1").addEventListener("blur", validateLoginFormPassword);
  document.querySelector("#login-form form").addEventListener("submit", handleLoginFormSubmit);

  function validateLoginFormEmail() {
    const email = this.value;
    const isValid = validateEmail(email);
    updateValidationFeedback("emailError", "emailValid", isValid, "Por favor, introduce un correo electrónico válido.");
  }

  function validateLoginFormPassword() {
    const password = this.value;
    const isValid = validatePassword(password);
    updateValidationFeedback("passwordError", "passwordValid", isValid, "La contraseña debe tener al menos 8 caracteres, incluir al menos una letra mayúscula, una minúscula y un número.");
  }

  function handleLoginFormSubmit(event) {
    event.preventDefault();
    const email = document.getElementById("exampleInputEmail1").value;
    const password = document.getElementById("exampleInputPassword1").value;

    if (!validateEmail(email) || !validatePassword(password)) {
      alert("Por favor, introduce un correo electrónico y una contraseña válidos.");
      return;
    }

    const sanitizedEmail = sanitizeString(email);
    const sanitizedPassword = sanitizeString(password);

    // Aquí puedes realizar la autenticación de inicio de sesión utilizando AJAX o algún otro método.
    //console.log("Correo electrónico: " + sanitizedEmail + ", Contraseña: " + sanitizedPassword);
  }
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const email = document.getElementById('exampleInputEmail1').value;
    const password = document.getElementById('exampleInputPassword1').value;
  
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
  
    const data = await response.json(); // Añadir esta línea para obtener los datos de la respuesta
  
    console.log(data); // Añade esta línea aquí
    if (response.status === 200) {
      // Inicio de sesión exitoso
      console.log(data); // Añadir esta línea para ver los datos recibidos
      if (data.is_admin == true) { // Verifica si el usuario es administrador
        window.location.href = "/control"; // Redirige al usuario administrador a control.ejs
      } else {
        window.location.href = "/index_auth"; // Redirige al usuario no administrador a index_auth.ejs
      }
    } else {
      // Muestra un mensaje de error si el inicio de sesión falla
      alert("Correo electrónico o contraseña incorrectos");
    }
    
  })}

// Configurar eventos de validación y envío del formulario de registro
setupRegisterFormValidation();

function setupRegisterFormValidation() {
  document.getElementById("registerName").addEventListener("blur", validateRegisterFormName);
  document.getElementById("registerEmail").addEventListener("blur", validateRegisterFormEmail);
  document.getElementById("registerCountry").addEventListener("blur", validateRegisterFormCountry);
  document.getElementById("registerPassword").addEventListener("blur", validateRegisterFormPassword);
  document.getElementById("registerPasswordConfirm").addEventListener("blur", validateRegisterFormPasswordConfirm);
  document.querySelector("#register-form form").addEventListener("submit", handleRegisterFormSubmit);

  function validateRegisterFormName() {
    const name = this.value;
    const isValid = name !== "";
    updateValidationFeedback("registerNameError", null, isValid, "Por favor, ingresa un nombre.");
  }

  function validateRegisterFormEmail() {
    const email = this.value;
    const isValid = validateEmail(email);
    updateValidationFeedback("registerEmailError", null, isValid, "Por favor, introduce un correo electrónico válido.");
  }

  function validateRegisterFormCountry() {
    const country = this.value;
    const isValid = country !== "";
    updateValidationFeedback("registerCountryError", null, isValid, "Por favor, ingresa un país.");
  }

  function validateRegisterFormPassword() {
    const password = this.value;
    const isValid = validatePassword(password);
    updateValidationFeedback("registerPasswordError", null, isValid, "La contraseña debe tener al menos 8 caracteres, incluir al menos una letra mayúscula, una minúscula y un número.");
  }

  function validateRegisterFormPasswordConfirm() {
    const password = document.getElementById("registerPassword").value;
    const passwordConfirm = this.value;
    const isValid = password === passwordConfirm;
    updateValidationFeedback("registerPasswordConfirmError", null, isValid, "Las contraseñas no coinciden. Por favor, verifica que ambas contraseñas sean iguales.");
  }

  function formatDateForMySQL(date) {
    return date.toISOString().slice(0, 19).replace('T', ' ');
  }
  
  function handleRegisterFormSubmit(event) {
    event.preventDefault();
  
    const name = document.getElementById("registerName").value;
    const email = document.getElementById("registerEmail").value;
    const country = document.getElementById("registerCountry").value;
    const password = document.getElementById("registerPassword").value;
    const passwordConfirm = document.getElementById("registerPasswordConfirm").value;
  
    if (name === "" || !validateEmail(email) || country === "" || !validatePassword(password) || password !== passwordConfirm) {
      alert("Por favor, complete todos los campos correctamente.");
      return;
    }
  
    const sanitizedName = sanitizeString(name);
    const sanitizedEmail = sanitizeString(email);
    const sanitizedCountry = sanitizeString(country);
    const sanitizedPassword = sanitizeString(password);
  
    const xhr = new XMLHttpRequest();
  
    xhr.open("POST", "/register", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        alert("Usuario registrado con éxito");
        // Si el registro es exitoso, cierra el modal y redirige a index_auth.ejs
        $('#loginModal').modal('hide'); // Reemplace 'loginModal' con el ID de su modal si es diferente
        window.location.href = "/index_auth";
      } else if (xhr.readyState === 4) {
        alert("Error al registrar el usuario");
      }
    };
    xhr.send(JSON.stringify({ 
      name: sanitizedName, 
      email: sanitizedEmail, 
      country: sanitizedCountry, 
      password: sanitizedPassword,
      registrationDate: formatDateForMySQL(new Date()),
      isAdmin: false
    }));
  }
  }
// Función auxiliar para actualizar la retroalimentación de validación en el formulario
function updateValidationFeedback(elementId, checkmarkId, isValid, errorMessage) {
  const errorElement = document.getElementById(elementId);
  if (isValid) {
    errorElement.style.display = "none";
    if (checkmarkId) {
      document.getElementById(checkmarkId).style.display = "block";
    }
  } else {
    errorElement.innerText = errorMessage;
    errorElement.style.display = "inline";
    if (checkmarkId) {
      document.getElementById(checkmarkId).style.display = "none";
    }
  }
}



  
