function getCookieValue(cookieName) {
  const cookieString = decodeURIComponent(document.cookie);
  const cookiesArray = cookieString.split(';');
  const cookieNameWithEqual = `${cookieName}=`;

  for (let cookie of cookiesArray) {
    cookie = cookie.trim();
    if (cookie.indexOf(cookieNameWithEqual) === 0) {
      return cookie.substring(cookieNameWithEqual.length, cookie.length);
    }
  }
  return '';
}

const logoutButton = document.getElementById("Logout");

logoutButton.addEventListener("click", async () => {
  // Elimina las cookies 'isLoggedIn' y 'username'
  document.cookie = "isLoggedIn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

  // Redirige al usuario a la página de inicio
  window.location.href = "/logout";
});



