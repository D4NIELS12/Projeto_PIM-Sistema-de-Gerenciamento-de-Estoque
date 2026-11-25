from flask import Blueprint, jsonify, request, session
from database.conexao import conectar_banco
from werkzeug.security import generate_password_hash, check_password_hash

auth_bp = Blueprint("auth", __name__)


# ==========================================
# CADASTRO DE USUARIO
# ==========================================

@auth_bp.route("/api/cadastro", methods=["POST"])
def cadastrar_usuario():

    dados = request.get_json()

    if not dados:
        return jsonify({"erro": "Dados não enviados."}), 400

    nome = dados.get("nome", "").strip()
    email = dados.get("email", "").strip().lower()
    senha = dados.get("senha", "")

    if not nome or not email or not senha:
        return jsonify({"erro": "Preencha todos os campos."}), 400

    if len(nome) > 100:
        return jsonify({"erro": "O nome ultrapassou o limite permitido."}), 400

    if len(email) > 150:
        return jsonify({"erro": "O email ultrapassou o limite permitido."}), 400

    if len(senha) < 6:
        return jsonify({"erro": "A senha deve ter pelo menos 6 caracteres."}), 400

    conexao = None
    cursor = None

    try:
        conexao = conectar_banco()
        cursor = conexao.cursor()

        # Verifica se o email já está cadastrado
        cursor.execute("""
            SELECT id_usuario
            FROM usuario
            WHERE email = ?
        """, (email,))

        usuario_existente = cursor.fetchone()

        if usuario_existente:
            return jsonify({"erro": "Este email já está cadastrado."}), 409

        # Cria o hash da senha
        senha_hash = generate_password_hash(senha)

        # Insere o novo usuario
        cursor.execute("""
            INSERT INTO usuario (nome, email, senha_hash)
            VALUES (?, ?, ?)
        """, (nome, email, senha_hash))

        conexao.commit()

        return jsonify({
            "mensagem": "Cadastro realizado com sucesso!"
        }), 201

    except Exception as erro:
        if conexao:
            conexao.rollback()

        print("Erro no cadastro:", erro)

        return jsonify({
            "erro": "Não foi possível realizar o cadastro."
        }), 500

    finally:
        if cursor:
            cursor.close()

        if conexao:
            conexao.close()


# ==========================================
# LOGIN
# ==========================================

@auth_bp.route("/api/login", methods=["POST"])
def login_usuario():

    dados = request.get_json()

    if not dados:
        return jsonify({"erro": "Dados não enviados."}), 400

    email = dados.get("email", "").strip().lower()
    senha = dados.get("senha", "")

    if not email or not senha:
        return jsonify({"erro": "Informe o email e a senha."}), 400

    conexao = None
    cursor = None

    try:
        conexao = conectar_banco()
        cursor = conexao.cursor()

        # Busca o usuario pelo email
        cursor.execute("""
            SELECT id_usuario, nome, email, senha_hash, ativo
            FROM usuario
            WHERE email = ?
        """, (email,))

        usuario = cursor.fetchone()

        # Verifica se o usuario existe e se a senha está correta
        if not usuario or not check_password_hash(usuario[3], senha):
            return jsonify({"erro": "Email ou senha incorretos."}), 401

        # Verifica se a conta está ativa
        if not usuario[4]:
            return jsonify({"erro": "Esta conta está desativada."}), 403

        # Guarda os dados do usuario na sessão
        session["id_usuario"] = usuario[0]
        session["nome_usuario"] = usuario[1]
        session["email_usuario"] = usuario[2]

        return jsonify({
            "mensagem": "Login realizado com sucesso!",
            "usuario": {
                "id": usuario[0],
                "nome": usuario[1],
                "email": usuario[2]
            }
        }), 200

    except Exception as erro:
        print("Erro no login:", erro)

        return jsonify({
            "erro": "Não foi possível realizar o login."
        }), 500

    finally:
        if cursor:
            cursor.close()

        if conexao:
            conexao.close()


# ==========================================
# LOGOUT
# ==========================================

@auth_bp.route("/api/logout", methods=["POST"])
def logout_usuario():

    session.clear()

    return jsonify({
        "mensagem": "Logout realizado com sucesso!"
    }), 200

    # ==========================================
# VERIFICAR EMAIL PARA RECUPERACAO DE SENHA
# ==========================================

@auth_bp.route("/api/verificar-email", methods=["POST"])
def verificar_email():

    dados = request.get_json()

    email = dados.get("email", "").strip().lower()

    if not email:
        return jsonify({
            "erro": "Informe seu e-mail."
        }), 400

    conexao = None
    cursor = None

    try:
        conexao = conectar_banco()
        cursor = conexao.cursor()

        cursor.execute("""
            SELECT id_usuario, nome, email
            FROM usuario
            WHERE email = ? AND ativo = 1
        """, (email,))

        usuario = cursor.fetchone()

        if not usuario:
            return jsonify({
                "erro": "E-mail não encontrado."
            }), 404

        return jsonify({
            "mensagem": "E-mail encontrado!",
            "usuario": {
                "id": usuario[0],
                "nome": usuario[1],
                "email": usuario[2]
            }
        }), 200

    except Exception as erro:
        print("Erro ao verificar e-mail:", erro)

        return jsonify({
            "erro": "Erro ao consultar o banco de dados."
        }), 500

    finally:
        if cursor:
            cursor.close()

        if conexao:
            conexao.close()



# ==========================================
# REDEFINIR SENHA
# ==========================================

@auth_bp.route("/api/redefinir-senha", methods=["POST"])
def redefinir_senha():

    dados = request.get_json()

    email = dados.get("email", "").strip().lower()
    nova_senha = dados.get("nova_senha", "")

    if not email or not nova_senha:
        return jsonify({
            "erro": "Preencha todos os campos."
        }), 400

    if len(nova_senha) < 6:
        return jsonify({
            "erro": "A senha deve ter pelo menos 6 caracteres."
        }), 400

    conexao = None
    cursor = None

    try:
        conexao = conectar_banco()
        cursor = conexao.cursor()

        cursor.execute("""
            UPDATE usuario
            SET senha_hash = ?
            WHERE email = ? AND ativo = 1
        """, (generate_password_hash(nova_senha), email))

        if cursor.rowcount == 0:
            return jsonify({
                "erro": "Usuário não encontrado."
            }), 404

        conexao.commit()

        return jsonify({
            "mensagem": "Senha redefinida com sucesso!"
        }), 200

    except Exception as erro:
        if conexao:
            conexao.rollback()

        print("Erro ao redefinir senha:", erro)

        return jsonify({
            "erro": "Erro ao redefinir senha."
        }), 500

    finally:
        if cursor:
            cursor.close()

        if conexao:
            conexao.close()

