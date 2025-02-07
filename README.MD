## **📦 Logística Colum...$ - Gerenciamento de Pedidos**

### **📌 Sobre o Projeto**

O **Logística Colum...$** é um sistema web para o gerenciamento de pedidos logísticos, permitindo que os usuários **cadastrem, editem, pesquisem e excluam pedidos** de forma intuitiva. O projeto foi desenvolvido como parte de um desafio técnico, visando demonstrar **boas práticas, organização do código e criatividade na implementação** .

### **✨ Destaques do Projeto**

✔ **Autenticação JWT** : Sistema de login seguro com armazenamento de token.

✔ **Gerenciamento de Pedidos** : CRUD completo (Criar, Ler, Atualizar, Excluir) integrado ao banco de dados.

✔ **Pesquisa Inteligente** : Filtro dinâmico que permite buscar pedidos pelo **ID, Cliente, Destino ou Status** .

✔ **Interface Responsiva** : Layout adaptável e interativo seguindo o design proposto.

✔ **Email para Recuperação de Senha** : Implementado via SMTP, permitindo redefinição de senha.

---

## **🚀 Tecnologias Utilizadas**

### **📌 Frontend**

- HTML5, CSS3 (responsivo e estilizado com variáveis globais)
- JavaScript (ES6+), manipulação dinâmica do DOM
- Fetch API para requisições assíncronas ao backend

### **📌 Backend**

- Python (Flask)
- Banco de Dados SQLite3
- Autenticação JWT para login seguro
- Bcrypt para criptografia de senhas
- Dotenv para gerenciamento de variáveis de ambiente
- Flask-CORS para permitir requisições do frontend

---

## **📂 Estrutura do Projeto**

```
DESAFIO_LOGÍSTICA
│- assets
│  │- fonts/
│  │- images/
│- backend
│  │- app.py         # Backend Flask
│  │- requirements.txt  # Dependências do projeto
│- database
│  │- data.db        # Banco de dados SQLite3
│- scripts
│  │- script.js      # Lógica do Frontend
│- styles
│  │- style.css      # Estilização do projeto
│- templates
│  │- index.html          # Tela de Login
│  │- pgPrincipal.html    # Tela de Pedidos
│  │- redefinir_senha.html  # Recuperação de senha
│  │- userRegistration.html  # Cadastro de usuário
│- .env         # Configuração de variáveis de ambiente
│- README.md            # Documentação do projeto
```

---

## **🛠️ Como Rodar o Projeto**

Para executar este projeto localmente, siga os passos abaixo:

### **1️⃣ Clone o repositório**

```sh
git clone https://github.com/seuusuario/logistica-columbus.git
cd logistica-columbus
```

### **2️⃣ Configure as variáveis de ambiente(inicialmente prontas para testarem)**

Crie um arquivo **`.env`** na raiz do projeto e adicione as configurações:

```ini
SECRET_KEY=sua_chave_secreta
DB_PATH=database/data.db
SMTP_USER=seu_email@gmail.com
SMTP_PASSWORD=sua_senha
```

> ⚠️ **Importante** : O arquivo `.env.example` contém um modelo das variáveis que devem ser configuradas.

### **3️⃣ Crie um ambiente virtual**

Para evitar conflitos entre dependências, crie um ambiente virtual Python:

```sh
python -m venv venv
```

Ative o ambiente virtual:

- **Windows** :

```sh
  venv\Scripts\activate
```

- **Mac/Linux** :

```sh
  source venv/bin/activate
```

### **4️⃣ Instale as dependências**

```sh
pip install -r backend/requirements.txt
```

### **5️⃣ Inicie o Servidor Flask**

```sh
python backend/app.py
```

O backend estará rodando em **`http://127.0.0.1:5000`** .

### **6️⃣ Inicie o Frontend**

Abra o arquivo `index.html` em seu navegador ou use o **Live Server** no VS Code.

---

## **📌 Endpoints da API**

### **🔑 Autenticação**

| Método | Rota               | Descrição                                  |
| ------ | ------------------ | ------------------------------------------ |
| POST   | `/login`           | Autentica o usuário e retorna um token JWT |
| POST   | `/cadastrar`       | Registra um novo usuário                   |
| POST   | `/esqueci_senha`   | Envia email de recuperação                 |
| POST   | `/redefinir_senha` | Redefine a senha com um token válido       |

### **📦 Pedidos**

| Método | Rota            | Descrição                    |
| ------ | --------------- | ---------------------------- |
| GET    | `/pedidos`      | Retorna todos os pedidos     |
| GET    | `/pedidos/<id>` | Retorna um pedido específico |
| POST   | `/pedidos`      | Cria um novo pedido          |
| PUT    | `/pedidos/<id>` | Atualiza um pedido existente |
| DELETE | `/pedidos/<id>` | Exclui um pedido             |

---

## **📌 Possíveis Melhorias Futuras**

- Implementação de **WebSockets** para atualizar pedidos em tempo real.
- Upload de arquivos para anexar **documentos de entrega** aos pedidos.
- Dashboard com **gráficos interativos** sobre a logística dos pedidos.
- Integração com **Google Maps API** para rastreamento de entregas.
- Gráficos interativos com preço dos commodities.

---

## **👨‍💻 Desenvolvedor**

**Nome:** Catiusci P. C. Scheffer

📧 Email: cpcscheffer@outlook.com

🔗 LinkedIn: [(2) Catiusci Pagnonceli Chaves Scheffer | LinkedIn](https://www.linkedin.com/in/catiuscipagnonceli-cienciasdacomputacao/)

🔗 GitHub: [CatiusciScheffer/Desafio_Log-stica](https://github.com/CatiusciScheffer/Desafio_Log-stica)
