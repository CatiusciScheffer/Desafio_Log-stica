document.getElementById("loginForm").addEventListener("submit", function(event) {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find(u => u.email === email && u.senha === senha);
  
  if (user) {
      alert("Login bem-sucedido!");
      window.location.href = "dashboard.html";
  } else {
      alert("E-mail ou senha incorretos!");
  }
});