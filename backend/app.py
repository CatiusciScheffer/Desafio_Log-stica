from flask import Flask, request, jsonify
import sqlite3
from flask_cors import CORS
import bcrypt
import jwt
from datetime import datetime, UTC, timedelta
import os
import smtplib
import secrets
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")


db_path = os.getenv("DB_PATH")
if not os.path.exists("database"):
    try:
        os.makedirs("database")
    except Exception as e:
        print(f"Erro ao criar pasta database: {e}")

def get_db_connection():
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


# 🔹 Rota para cadastrar usuário
@app.route("/cadastrar", methods=["POST"])
def cadastrar():
    data = request.get_json()
    nome = data.get("nome")
    email = data.get("email")
    senha = data.get("senha")

    if not nome or not email or not senha:
        return jsonify({"erro": "Preencha todos os campos!"}), 400

    senha_hash = bcrypt.hashpw(senha.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    conn = get_db_connection()
    try:
        conn.execute("INSERT INTO users (user_name, user_email, user_senha) VALUES (?, ?, ?)", (nome, email, senha_hash))
        conn.commit()
        return jsonify({"mensagem": "Usuário cadastrado com sucesso!"}), 201
    except sqlite3.IntegrityError:
        return jsonify({"erro": "E-mail já cadastrado!"}), 400
    finally:
        conn.close()


# 🔹 Rota para login
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    senha = data.get("senha")

    if not email or not senha:
        return jsonify({"erro": "Preencha todos os campos!"}), 400

    conn = get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE user_email = ?", (email,)).fetchone()
    conn.close()

    if not user:
        return jsonify({"erro": "E-mail não encontrado!"}), 404

    if not bcrypt.checkpw(senha.encode(), user["user_senha"].encode()):
        return jsonify({"erro": "Senha incorreta!"}), 401

    print(dict(user))  # Verificar no console se o nome está correto

    # 🔹 Ajuste para capturar corretamente o nome do usuário
    nome_usuario = user["user_name"] if "user_name" in user else user[1]

    token = jwt.encode(
        {
            "id": user["id"],
            "email": email,
            "nome": nome_usuario,  # 🔹 Garantindo que o nome vá para o token
            "exp": datetime.now(UTC) + timedelta(hours=1)
        },
        SECRET_KEY,
        algorithm="HS256"
    )

    return jsonify({"token": token})


            # "exp": datetime.now(UTC) + timedelta(hours=1) 

# 🔹 Rota para recuperar senha
@app.route("/esqueci_senha", methods=["POST"])
def esqueci_senha():
    data = request.get_json()
    email = data.get("email")

    conn = get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE user_email = ?", (email,)).fetchone()
    conn.close()

    if not user:
        return jsonify({"erro": "E-mail não encontrado!"}), 404

    token = secrets.token_urlsafe(32)  # Gera um token aleatório seguro

    # Salva o token no banco 
    token_expira = datetime.utcnow() + timedelta(hours=1)
    conn = get_db_connection()
    # conn.execute("UPDATE users SET reset_token_expiration = ? WHERE user_email = ?", (token, email))
    conn.execute("UPDATE users SET reset_token=?, reset_token_expiration=? WHERE user_email=?", 
             (token, token_expira, email))
    conn.commit()
    conn.close()

    # Enviar e-mail com o link de redefinição
    reset_link = f"http://127.0.0.1:5500/redefinir_senha.html?token={token}"
    enviar_email(email, reset_link)

    return jsonify({"mensagem": "E-mail de recuperação enviado!"})


# 🔹 Rota para enviar email e recuperar senha
def enviar_email(destinatario, link):
    remetente = os.getenv("SMTP_USER")
    senha = os.getenv("SMTP_PASSWORD")

    print(f"🔹 Enviando e-mail para: {destinatario}")  # DEBUG

    # Corpo do e-mail em HTML
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #444444;">Recuperação de Senha - Columbus</h2>
        <p>Olá,</p>
        <p>Recebemos uma solicitação para redefinir sua senha de acesso à plataforma da <strong>Columbus</strong>.</p>
        <p>Se foi você quem solicitou, clique no botão abaixo para criar uma nova senha:</p>
        <p style="text-align: center;">
            <a href="{link}" style="
                display: inline-block;
                background-color: #ffdfff;
                color: #008171;
                padding: 12px 20px;
                text-decoration: none;
                border-radius: 8px;
                font-size: 16px;
            ">Redefinir Senha</a>
        </p>
        <p>Se você não solicitou esta alteração, ignore este e-mail. Sua senha permanecerá a mesma.</p>
        <p>Atenciosamente,</p>
        <p><strong>Equipe Columbus</strong><br>
        Suporte Técnico</p>
    </body>
    </html>
    """

    msg = MIMEMultipart()
    msg["Subject"] = "Columbus | Recuperação de Senha"
    msg["From"] = remetente
    msg["To"] = destinatario
    msg.attach(MIMEText(html_content, "html"))

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(remetente, senha)
            server.sendmail(remetente, destinatario, msg.as_string())
        print("✅ E-mail enviado com sucesso!")
    except Exception as e:
        print(f"❌ Erro ao enviar e-mail: {e}")



# 🔹 Rota para redefinir senha
@app.route("/redefinir_senha", methods=["POST"])
def redefinir_senha():
    data = request.get_json()
    token = data.get("token")
    nova_senha = data.get("senha")

    if not token or not nova_senha:
        return jsonify({"erro": "Dados inválidos!"}), 400

    conn = get_db_connection()
    # user = conn.execute("SELECT * FROM users WHERE reset_token_expiration = ?", (token,)).fetchone()
    
    user = conn.execute("SELECT * FROM users WHERE reset_token=? AND reset_token_expiration > ?", 
                    (token, datetime.utcnow())).fetchone()

    if not user:
        return jsonify({"erro": "Token inválido ou expirado!"}), 400

    senha_hash = bcrypt.hashpw(nova_senha.encode(), bcrypt.gensalt()).decode()

    conn.execute("UPDATE users SET user_senha = ?, reset_token_expiration = NULL WHERE reset_token_expiration = ?", (senha_hash, token))
    conn.commit()
    conn.close()

    return jsonify({"mensagem": "Senha redefinida com sucesso!"})


# 🔹 Obter um pedido específico para edição
@app.route("/pedidos/<int:id>", methods=["GET"])
def obter_pedido(id):
    conn = get_db_connection()
    pedido = conn.execute("SELECT * FROM pedidos WHERE id = ?", (id,)).fetchone()
    conn.close()

    if pedido:
        return jsonify(dict(pedido))
    else:
        return jsonify({"erro": "Pedido não encontrado!"}), 404


# 🔹 Listar todos os pedidos
@app.route("/pedidos", methods=["GET"])
def listar_pedidos():
    conn = get_db_connection()
    pedidos = conn.execute("SELECT * FROM pedidos").fetchall()
    conn.close()

    return jsonify([dict(pedido) for pedido in pedidos])

# 🔹 Adicionar um novo pedido
@app.route("/pedidos", methods=["POST"])
def adicionar_pedido():
    data = request.get_json()
    cliente = data.get("cliente")
    destino = data.get("destino")
    status = data.get("status", "Pendente")

    if not cliente or not destino:
        return jsonify({"erro": "Preencha todos os campos!"}), 400

    conn = get_db_connection()
    conn.execute("INSERT INTO pedidos (cliente, destino, status) VALUES (?, ?, ?)",
                 (cliente, destino, status))
    conn.commit()
    conn.close()

    return jsonify({"mensagem": "Pedido adicionado com sucesso!"}), 201

# 🔹 Editar um pedido existente
@app.route("/pedidos/<int:id>", methods=["PUT"])
def editar_pedido(id):
    data = request.get_json()
    cliente = data.get("cliente")
    destino = data.get("destino")
    status = data.get("status")

    conn = get_db_connection()
    pedido = conn.execute("SELECT * FROM pedidos WHERE id = ?", (id,)).fetchone()

    if not pedido:
        return jsonify({"erro": "Pedido não encontrado!"}), 404

    conn.execute("UPDATE pedidos SET cliente = ?, destino = ?, status = ? WHERE id = ?",
                 (cliente, destino, status, id))
    conn.commit()
    conn.close()

    return jsonify({"mensagem": "Pedido atualizado com sucesso!"})

# 🔹 Excluir um pedido
@app.route("/pedidos/<int:id>", methods=["DELETE"])
def excluir_pedido(id):
    conn = get_db_connection()
    pedido = conn.execute("SELECT * FROM pedidos WHERE id = ?", (id,)).fetchone()

    if not pedido:
        return jsonify({"erro": "Pedido não encontrado!"}), 404

    conn.execute("DELETE FROM pedidos WHERE id = ?", (id,))
    conn.commit()
    conn.close()

    return jsonify({"mensagem": "Pedido excluído com sucesso!"})



if __name__ == "__main__":
    app.run(debug=True)
