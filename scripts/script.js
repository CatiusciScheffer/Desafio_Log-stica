let pedidos = [];

function atualizarListaPedidos(pedidos) {
  const tabela = document.getElementById('tabela-pedidos');
  tabela.innerHTML = ''; // Limpa a tabela antes de preencher

  pedidos.forEach((pedido) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${pedido.id}</td>
      <td>${pedido.cliente}</td>
      <td>${pedido.destino}</td>
      <td>${pedido.status}</td>
      <td>
        <button class="btn-editar" data-id="${pedido.id}">✏️ Editar</button>
        <button class="btn-excluir" data-id="${pedido.id}">🗑️ Excluir</button>
      </td>
    `;
    tabela.appendChild(row);
  });

  // 🔹 Agora os elementos existem no DOM, então adicionamos os eventos:
  document.querySelectorAll('.btn-editar').forEach((botao) => {
    botao.addEventListener('click', (event) => {
      const id = event.target.getAttribute('data-id');
      editarPedido(id);
    });
  });

  document.querySelectorAll('.btn-excluir').forEach((botao) => {
    botao.addEventListener('click', (event) => {
      const id = event.target.getAttribute('data-id');
      if (confirm('Tem certeza que deseja excluir este pedido?')) {
        deletarPedido(id);
      }
    });
  });

  contadorPedidos.textContent = `Total de pedidos: ${pedidos.length}`;
  
}


function filtrarPedidos() {
  const termoPesquisa = document.getElementById("inputPesquisa").value.toLowerCase();
  const pedidosFiltrados = pedidos.filter(pedido => {
    // Para cada pedido, converte todos os valores em string e verifica se contém o termo
    return Object.values(pedido).some(valor =>
      String(valor).toLowerCase().includes(termoPesquisa)
    );
  });
  atualizarListaPedidos(pedidosFiltrados);
}


document.addEventListener('DOMContentLoaded', function () {

  carregarPedidos();
  
  // Verifica em qual página estamos para associar os eventos corretamente
  if (document.getElementById('loginForm')) {
    configurarLogin();
  } else if (document.getElementById('cadastroForm')) {
    configurarCadastro();
  }

  // 🔹 Exibir o nome do usuário logado na página (caso exista um token)
  const token =
    localStorage.getItem('userToken') || sessionStorage.getItem('userToken');

  if (token) {
    try {
      // Decodificar o token (extrai os dados do payload JWT)
      const payload = JSON.parse(atob(token.split('.')[1]));

      // Define o nome do usuário no HTML
      const userNameElement = document.querySelector('.user-name');
      if (userNameElement) {
        userNameElement.textContent = payload.nome || 'Usuário';
      }
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
    }
  }

  // 🔹 Lógica para o modal de esqueci a senha
  const forgotPasswordLink = document.querySelector('.forgot');
  if (forgotPasswordLink) {
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
        .then((data) => {
          console.log('Resposta da redefinição de senha:', data);

          alert(data.mensagem);

          if (data.sucesso) {
            console.log('Redirecionando para a página de login...');
            window.location.href = 'index.html';
          } else {
            console.log('Erro na redefinição de senha');
          }
        })
        .catch((error) => {
          console.error('Erro ao redefinir a senha:', error);
          alert('Ocorreu um erro ao tentar redefinir a senha.');
        });

      modal.style.display = 'none';
    });
  }

  // ---------------- Pedidos --------------------------
  const modalPedido = document.getElementById('modalPedido');
  const btnAdicionar = document.querySelector('.add-button');
  const btnFecharModal = document.querySelector('.close_modal_principal');
  const btnSalvarPedido = document.getElementById('btnSalvarPedido');
  const clienteNome = document.getElementById('clienteNome');
  const destino = document.getElementById('destino');
  const statusPedido = document.getElementById('statusPedido');
  

  // Abre o modal ao clicar no botão "+"
  btnAdicionar.addEventListener('click', () => {
    modalPedido.style.display = 'block';
  });

  // Fecha o modal ao clicar no botão "X"
  btnFecharModal.addEventListener('click', () => {
    modalPedido.style.display = 'none';
  });

  // Fecha o modal se o usuário clicar fora do modal
  window.addEventListener('click', (event) => {
    if (event.target === modalPedido) {
      modalPedido.style.display = 'none';
    }
  });

  // Função para buscar pedidos do backend
  async function carregarPedidos() {
    try {
      const response = await fetch('http://127.0.0.1:5000/pedidos');
      if (!response.ok) throw new Error(`Erro: ${response.status}`);

      const pedidos = await response.json();
      console.log('Pedidos recebidos:', pedidos);
      atualizarListaPedidos(pedidos);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
    }
  }

 
  // Adiciona um novo pedido ao banco
  btnSalvarPedido.addEventListener('click', async () => {
    const novoPedido = {
      cliente: clienteNome.value,
      destino: destino.value,
      status: statusPedido.value,
    };

    try {
      const response = await fetch('http://127.0.0.1:5000/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoPedido),
      });

      if (response.ok) {
        modalPedido.style.display = 'none';
        clienteNome.value = '';
        destino.value = '';
        statusPedido.value = 'Pendente';
        carregarPedidos();
      } else {
        console.error('Erro ao salvar pedido.');
      }
    } catch (error) {
      console.error('Erro ao conectar ao servidor:', error);
    }
  });

  const inputPesquisa = document.getElementById("inputPesquisa");
  if (inputPesquisa) {
    inputPesquisa.addEventListener("input", filtrarPedidos);
  } else {
    console.error("Elemento com id 'inputPesquisa' não foi encontrado no HTML.");
  }

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

function mostrarMensagem(tipo, mensagem) {
  const msgDiv = document.getElementById('mensagemErro');
  msgDiv.innerText = mensagem;
  msgDiv.style.color = tipo === 'erro' ? 'red' : 'green';
  msgDiv.style.display = 'block';
}


async function deletarPedido(id) {
  try {
    const response = await fetch(`http://127.0.0.1:5000/pedidos/${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      alert('Pedido excluído com sucesso!');
      carregarPedidos(); // Atualiza a lista após excluir
    } else {
      const erro = await response.json();
      alert(`Erro ao excluir: ${erro.erro}`);
    }
  } catch (error) {
    console.error('Erro ao excluir pedido:', error);
  }
}


async function carregarPedidos() {
  try {
    const response = await fetch('http://127.0.0.1:5000/pedidos');
    if (!response.ok) throw new Error(`Erro: ${response.status}`);

    // Atribua à variável global "pedidos", sem redeclará-la
    pedidos = await response.json();
    console.log('Pedidos recebidos:', pedidos);
    atualizarListaPedidos(pedidos);
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
  }
}


function editarPedido(idPedido) {
  
  idPedido = Number(idPedido);

  // Buscar o pedido pelo ID
  const pedido = pedidos.find(p => p.id == idPedido);

  if (!pedido) {
    console.error("Pedido não encontrado!");
    return;
  }

  // Preencher o modal com os dados do pedido selecionado
  const clienteNome = document.getElementById("clienteNome");
  const destino = document.getElementById("destino");
  const statusPedido = document.getElementById("statusPedido");

  if (!clienteNome || !destino || !statusPedido) {
    console.error("Elementos do formulário não encontrados.");
    return;
  }

  clienteNome.value = pedido.cliente;
  destino.value = pedido.destino;
  statusPedido.value = pedido.status;

  // Exibir o modal de edição (mesmo modal de adição)
  const modalPedido = document.getElementById("modalPedido");
  modalPedido.style.display = "block";

  // Alterar o botão para salvar as edições
  const btnSalvarPedido = document.getElementById("btnSalvarPedido");
  btnSalvarPedido.onclick = async function () {
    await salvarEdicaoPedido(idPedido);
  };
}


async function salvarEdicaoPedido(idPedido) {
  const clienteNome = document.getElementById("clienteNome").value;
  const destino = document.getElementById("destino").value;
  const statusPedido = document.getElementById("statusPedido").value;

  const pedidoAtualizado = {
    cliente: clienteNome,
    destino: destino,
    status: statusPedido
  };

  try {
    const response = await fetch(`http://127.0.0.1:5000/pedidos/${idPedido}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(pedidoAtualizado)
    });

    if (response.ok) {
      alert("Pedido atualizado com sucesso!");
      document.getElementById("modalPedido").style.display = "none";
      carregarPedidos(); // Atualiza a lista de pedidos
    } else {
      console.error("Erro ao atualizar pedido.");
    }
  } catch (error) {
    console.error("Erro ao conectar ao servidor:", error);
  }
}




