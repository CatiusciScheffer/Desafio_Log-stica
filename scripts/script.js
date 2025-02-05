document.addEventListener('DOMContentLoaded', function () {
  // Verifica em qual página estamos para associar os eventos corretamente
  if (document.getElementById('loginForm')) {
    configurarLogin();
  } else if (document.getElementById('cadastroForm')) {
    configurarCadastro();
  }

  const forgotPasswordLink = document.querySelector('.forgot');
  const modal = document.getElementById('forgotPasswordModal');
  const closeModal = document.querySelector('.close');
  const sendResetLink = document.getElementById('sendResetLink');

  // Abre o modal
  forgotPasswordLink.addEventListener('click', function (event) {
    event.preventDefault();
    modal.style.display = 'block';
  });

  // Fecha o modal
  closeModal.addEventListener('click', function () {
    modal.style.display = 'none';
  });

  // Envia a solicitação de redefinição de senha
  sendResetLink.addEventListener('click', function () {
    const email = document.getElementById('forgotEmail').value;

    if (!email) {
      alert('Digite seu e-mail!');
      return;
    }

    fetch('http://127.0.0.1:5000/esqueci_senha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email }),
    })
      .then((response) => response.json())
      .then((data) => alert(data.mensagem))
      .catch((error) => console.error('Erro:', error));

    modal.style.display = 'none';
  });
});

// 🔹 Lógica para login do usuário
function configurarLogin() {
  const loginForm = document.getElementById('loginForm');

  loginForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const manterConectado = document.getElementById('manterConectado').checked;

    try {
      const response = await fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Login realizado com sucesso!');

        if (manterConectado) {
          localStorage.setItem('userToken', data.token);
        } else {
          sessionStorage.setItem('userToken', data.token);
        }

        window.location.href = 'pgPrincipal.html'; // Redireciona após login
      } else {
        mostrarMensagem('erro', data.erro);
      }
    } catch (error) {
      console.error('Erro ao tentar logar:', error);
      alert('Erro ao conectar com o servidor.');
    }
  });

  // Redireciona para a página de cadastro ao clicar em "Criar conta"
  const btnCriarConta = document.querySelector('.bt_criar_conta');
  if (btnCriarConta) {
    btnCriarConta.addEventListener('click', function () {
      window.location.href = 'userRegistration.html';
    });
  }
}

// 🔹 Lógica para cadastro do usuário
function configurarCadastro() {
  const cadastroForm = document.getElementById('cadastroForm');

  cadastroForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const confirmSenha = document.getElementById('confirmSenha').value;

    // 🔐 Validação da senha (mínimo 6 caracteres, 1 letra maiúscula e 1 caractere especial)
    const senhaRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}":;'?/.,<>]).{6,}$/;
    if (!senhaRegex.test(senha)) {
      alert(
        'A senha deve ter pelo menos 6 caracteres, uma letra maiúscula e um caractere especial.'
      );
      return;
    }

    if (senha !== confirmSenha) {
      alert('As senhas não coincidem!');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/cadastrar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome, email, senha }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Cadastro realizado com sucesso! Faça o login.');
        window.location.href = 'index.html'; // Redireciona para login
      } else {
        mostrarMensagem('erro', data.erro);
      }
    } catch (error) {
      console.error('Erro ao cadastrar usuário:', error);
      alert('Erro ao conectar com o servidor.');
    }
  });

  // Redireciona para a página de login ao clicar em "Já tenho conta"
  const btnJaTenhoConta = document.querySelector('.bt_criar_conta');
  if (btnJaTenhoConta) {
    btnJaTenhoConta.addEventListener('click', function () {
      window.location.href = 'index.html';
    });
  }
}

// 🔹 Protege páginas que requerem autenticação
function verificarAutenticacao() {
  const token =
    localStorage.getItem('userToken') || sessionStorage.getItem('userToken');

  if (!token) {
    alert('Você precisa estar logado para acessar esta página.');
    window.location.href = 'index.html'; // Redireciona para login
  }
}

function mostrarMensagem(tipo, mensagem) {
  const msgDiv = document.getElementById('mensagemErro');
  if (!msgDiv) return alert(mensagem);

  msgDiv.innerText = mensagem;
  msgDiv.style.color = tipo === 'erro' ? 'red' : 'green';
  msgDiv.style.display = 'block';
}
