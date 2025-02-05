from flask import Flask, request, jsonify
import sqlite3
from flask_cors import CORS
import bcrypt
import jwt
import datetime
import os
import smtplib
import secrets
from email.mime.text import MIMEText

app = Flask(__name__)
CORS(app)
SECRET_KEY = "926552ca4a6019a2"


db_path = "instance/data.db"
if not os.path.exists("instance"):
    try:
        os.makedirs("instance")
    except Exception as e:
        print(f"Erro ao criar pasta instance: {e}")

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

    # 🔹 Gerar token JWT
    token = jwt.encode(
        {"email": email, "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)},
        SECRET_KEY,
        algorithm="HS256"
    )

    return jsonify({"mensagem": "Login realizado com sucesso!", "token": token})


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

    # Salva o token no banco (idealmente com um tempo de expiração)
    conn = get_db_connection()
    conn.execute("UPDATE users SET reset_token_expiration = ? WHERE user_email = ?", (token, email))
    conn.commit()
    conn.close()

    # Enviar e-mail com o link de redefinição
    reset_link = f"http://127.0.0.1:5500/redefinir_senha.html?token={token}"
    enviar_email(email, reset_link)

    return jsonify({"mensagem": "E-mail de recuperação enviado!"})


# 🔹 Rota para enviar email e recuperar senha
def enviar_email(destinatario, link):
    remetente = "catiusci.ctadigital@gmail.com"
    senha = "eerk vrqj oyfj zirf"

    print(f"🔹 Enviando e-mail para: {destinatario}")  # DEBUG

    msg = MIMEText(f"Clique no link para redefinir sua senha: {link}")
    msg["Subject"] = "Recuperação de Senha"
    msg["From"] = remetente
    msg["To"] = destinatario

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
    user = conn.execute("SELECT * FROM users WHERE reset_token_expiration = ?", (token,)).fetchone()

    if not user:
        return jsonify({"erro": "Token inválido ou expirado!"}), 400

    senha_hash = bcrypt.hashpw(nova_senha.encode(), bcrypt.gensalt()).decode()

    conn.execute("UPDATE users SET user_senha = ?, reset_token_expiration = NULL WHERE reset_token_expiration = ?", (senha_hash, token))
    conn.commit()
    conn.close()

    return jsonify({"mensagem": "Senha redefinida com sucesso!"})


if __name__ == "__main__":
    app.run(debug=True)
