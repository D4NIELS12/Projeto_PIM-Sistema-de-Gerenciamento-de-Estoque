from flask import Blueprint, jsonify, request
from database.conexao import conectar_banco

fornecedores_bp = Blueprint("fornecedores", __name__)


# Formata o telefone para exibição
def formatar_telefone(telefone):
    if not telefone:
        return ""

    numero = "".join(filter(str.isdigit, str(telefone)))

    if len(numero) == 11:
        return f"({numero[:2]}) {numero[2:7]}-{numero[7:]}"

    if len(numero) == 10:
        return f"({numero[:2]}) {numero[2:6]}-{numero[6:]}"

    return numero


# Formata o CNPJ para exibição
def formatar_cnpj(cnpj):
    if not cnpj:
        return ""

    numero = "".join(filter(str.isdigit, str(cnpj)))

    if len(numero) != 14:
        return numero

    return (
        f"{numero[:2]}.{numero[2:5]}."
        f"{numero[5:8]}/{numero[8:12]}-{numero[12:]}"
    )


# Prepara os dados para enviar ao JavaScript
def preparar_fornecedor(fornecedor):
    return {
        "id": fornecedor[0],
        "nome": fornecedor[1],
        "telefone": formatar_telefone(fornecedor[2]),
        "email": fornecedor[3],
        "cnpj": formatar_cnpj(fornecedor[4]),
        "tipo": fornecedor[5],
        "cidade": fornecedor[6] or "",
        "uf": fornecedor[7] or "",
        "observacao": fornecedor[8] or ""
    }


# Lista todos os fornecedores
@fornecedores_bp.route("/api/fornecedores", methods=["GET"])
def listar_fornecedores():
    conexao = conectar_banco()
    cursor = conexao.cursor()

    try:
        cursor.execute("""
            SELECT
                id_fornecedor, 
                nome,
                telefone,
                email,
                CNPJ,
                tipo,
                cidade,
                uf,
                observacao
            FROM fornecedor
            ORDER BY nome
        """)

        fornecedores = [
            preparar_fornecedor(linha)
            for linha in cursor.fetchall()
        ]

        return jsonify(fornecedores), 200

    except Exception as erro:
        return jsonify({"erro": str(erro)}), 500

    finally:
        cursor.close()
        conexao.close()


# Cadastra um fornecedor
@fornecedores_bp.route("/api/fornecedores", methods=["POST"])
def cadastrar_fornecedor():
    dados = request.get_json(silent=True) or {}

    nome = str(dados.get("nome", "")).strip()
    cnpj = "".join(filter(str.isdigit, str(dados.get("cnpj", ""))))
    tipo = str(dados.get("tipo", "")).strip()
    telefone = "".join(filter(str.isdigit, str(dados.get("telefone", ""))))
    email = str(dados.get("email", "")).strip()
    cidade = str(dados.get("cidade", "")).strip()
    uf = str(dados.get("uf", "")).strip().upper()

    if not all([nome, tipo, telefone, email, cidade, uf]):
        return jsonify({"erro": "Preencha todos os campos obrigatórios."}), 400

    if cnpj and len(cnpj) != 14:
        return jsonify({"erro": "CNPJ inválido."}), 400

    if len(telefone) not in [10, 11]:
        return jsonify({"erro": "Telefone inválido."}), 400

    if tipo not in ["Nacional", "Internacional"]:
        return jsonify({"erro": "Tipo de fornecedor inválido."}), 400

    conexao = conectar_banco()
    cursor = conexao.cursor()

    try:
        cursor.execute("""
            INSERT INTO fornecedor
                (nome, telefone, email, CNPJ, tipo, cidade, uf)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, nome, telefone, email, cnpj or None, tipo, cidade, uf)

        conexao.commit()

        return jsonify({
            "mensagem": "Fornecedor cadastrado com sucesso."
        }), 201

    except Exception as erro:
        conexao.rollback()
        return jsonify({"erro": str(erro)}), 500

    finally:
        cursor.close()
        conexao.close()


# Edita um fornecedor
@fornecedores_bp.route("/api/fornecedores/<int:id>", methods=["PUT"])
def editar_fornecedor(id):
    dados = request.get_json(silent=True) or {}

    nome = str(dados.get("nome", "")).strip()
    cnpj = "".join(filter(str.isdigit, str(dados.get("cnpj", ""))))
    tipo = str(dados.get("tipo", "")).strip()
    telefone = "".join(filter(str.isdigit, str(dados.get("telefone", ""))))
    email = str(dados.get("email", "")).strip()
    cidade = str(dados.get("cidade", "")).strip()
    uf = str(dados.get("uf", "")).strip().upper()

    if not all([nome, tipo, telefone, email, cidade, uf]):
        return jsonify({"erro": "Preencha todos os campos obrigatórios."}), 400

    if cnpj and len(cnpj) != 14:
        return jsonify({"erro": "CNPJ inválido."}), 400

    if len(telefone) not in [10, 11]:
        return jsonify({"erro": "Telefone inválido."}), 400

    if tipo not in ["Nacional", "Internacional"]:
        return jsonify({"erro": "Tipo de fornecedor inválido."}), 400

    conexao = conectar_banco()
    cursor = conexao.cursor()

    try:
        cursor.execute("""
            UPDATE fornecedor
            SET
                nome = ?,
                telefone = ?,
                email = ?,
                CNPJ = ?,
                tipo = ?,
                cidade = ?,
                uf = ?
            WHERE id_fornecedor = ?
        """, nome, telefone, email, cnpj or None,
             tipo, cidade, uf, id)

        if cursor.rowcount == 0:
            return jsonify({"erro": "Fornecedor não encontrado."}), 404

        conexao.commit()

        return jsonify({
            "mensagem": "Fornecedor atualizado com sucesso."
        }), 200

    except Exception as erro:
        conexao.rollback()
        return jsonify({"erro": str(erro)}), 500

    finally:
        cursor.close()
        conexao.close()


# Atualiza a observação
@fornecedores_bp.route(
    "/api/fornecedores/<int:id>/observacao",
    methods=["PUT"]
)
def atualizar_observacao(id):
    dados = request.get_json(silent=True) or {}
    observacao = str(dados.get("observacao", "")).strip()

    if len(observacao) > 500:
        return jsonify({"erro": "A observação deve ter até 500 caracteres."}), 400

    conexao = conectar_banco()
    cursor = conexao.cursor()

    try:
        cursor.execute("""
            UPDATE fornecedor
            SET observacao = ?
            WHERE id_fornecedor = ?
        """, observacao or None, id)

        if cursor.rowcount == 0:
            return jsonify({"erro": "Fornecedor não encontrado."}), 404

        conexao.commit()

        return jsonify({
            "mensagem": "Observação atualizada com sucesso."
        }), 200

    except Exception as erro:
        conexao.rollback()
        return jsonify({"erro": str(erro)}), 500

    finally:
        cursor.close()
        conexao.close()


# Exclui um fornecedor
@fornecedores_bp.route("/api/fornecedores/<int:id>", methods=["DELETE"])
def excluir_fornecedor(id):
    conexao = conectar_banco()
    cursor = conexao.cursor()

    try:
        cursor.execute("""
            DELETE FROM fornecedor
            WHERE id_fornecedor = ?
        """, id)

        if cursor.rowcount == 0:
            return jsonify({"erro": "Fornecedor não encontrado."}), 404

        conexao.commit()

        return jsonify({
            "mensagem": "Fornecedor excluído com sucesso."
        }), 200

    except Exception as erro:
        conexao.rollback()

        return jsonify({
            "erro": "Não foi possível excluir. Verifique se existem produtos vinculados a este fornecedor."
        }), 409

    finally:
        cursor.close()
        conexao.close()
