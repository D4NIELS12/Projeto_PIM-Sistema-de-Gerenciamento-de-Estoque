from flask import Blueprint, jsonify, request
from database.conexao import conectar_banco

categorias_bp = Blueprint("categorias", __name__)


# ==========================================
# LISTAR CATEGORIAS
# ==========================================

@categorias_bp.route("/api/categorias", methods=["GET"])
def listar_categorias():

    conexao = conectar_banco()
    cursor = conexao.cursor()

    try:

        cursor.execute("""
            SELECT
                c.id_categoria,
                c.nome,
                c.descricao,
                COUNT(p.id_produto) AS quantidade_produtos
            FROM categoria c
            LEFT JOIN produto p
                ON c.id_categoria = p.id_categoria
            GROUP BY c.id_categoria, c.nome, c.descricao
            ORDER BY c.nome
        """)

        resultados = cursor.fetchall()

        categorias = [
            {
                "id": linha[0],
                "nome": linha[1],
                "descricao": linha[2],
                "quantidade_produtos": linha[3]
            }
            for linha in resultados
        ]

        return jsonify(categorias)

    finally:
        cursor.close()
        conexao.close()


# ==========================================
# CADASTRAR CATEGORIA
# ==========================================

@categorias_bp.route("/api/categorias", methods=["POST"])
def cadastrar_categoria():

    dados = request.get_json(silent=True)

    if not isinstance(dados, dict):
        return jsonify({"erro": "Dados inválidos."}), 400

    nome = str(dados.get("nome", "")).strip()
    descricao = str(dados.get("descricao") or "").strip()

    # Valida os campos
    if not nome:
        return jsonify({
            "erro": "O nome da categoria é obrigatório."
        }), 400

    if len(nome) > 80 or len(descricao) > 200:
        return jsonify({
            "erro": "O nome ou a descrição ultrapassaram o limite permitido."
        }), 400

    conexao = conectar_banco()
    cursor = conexao.cursor()

    try:

        # Verifica se a categoria já existe
        cursor.execute("""
            SELECT id_categoria
            FROM categoria
            WHERE nome = ?
        """, (nome,))

        if cursor.fetchone():
            return jsonify({
                "erro": "Já existe uma categoria com esse nome."
            }), 409

        # Insere a categoria no banco
        cursor.execute("""
            INSERT INTO categoria (nome, descricao)
            OUTPUT INSERTED.id_categoria
            VALUES (?, ?)
        """, (nome, descricao or None))

        id_categoria = cursor.fetchone()[0]

        conexao.commit()

        return jsonify({
            "mensagem": "Categoria cadastrada com sucesso.",
            "id_categoria": id_categoria
        }), 201

    except Exception as erro:

        conexao.rollback()

        print("Erro ao cadastrar categoria:", erro)

        return jsonify({
            "erro": "Não foi possível cadastrar a categoria."
        }), 500

    finally:
        cursor.close()
        conexao.close()

# ==========================================
# EDITAR CATEGORIA
# ==========================================

@categorias_bp.route("/api/categorias/<int:id_categoria>", methods=["PUT"])
def editar_categoria(id_categoria):

    dados = request.get_json(silent=True)

    if not isinstance(dados, dict):
        return jsonify({"erro": "Dados inválidos."}), 400

    nome = str(dados.get("nome", "")).strip()
    descricao = str(dados.get("descricao") or "").strip()

    # Valida os campos
    if not nome:
        return jsonify({
            "erro": "O nome da categoria é obrigatório."
    }), 400

    if len(nome) > 80 or len(descricao) > 200:
        return jsonify({
            "erro": "O nome ou a descrição ultrapassaram o limite permitido."
        }), 400

    conexao = conectar_banco()
    cursor = conexao.cursor()

    try:

        # Verifica se a categoria existe
        cursor.execute("""
            SELECT id_categoria
            FROM categoria
            WHERE id_categoria = ?
        """, (id_categoria,))

        if not cursor.fetchone():
            return jsonify({
                "erro": "Categoria não encontrada."
            }), 404

        # Verifica se o nome já pertence a outra categoria
        cursor.execute("""
            SELECT id_categoria
            FROM categoria
            WHERE nome = ?
            AND id_categoria <> ?
        """, (nome, id_categoria))

        if cursor.fetchone():
            return jsonify({
                "erro": "Já existe outra categoria com esse nome."
            }), 409

        # Atualiza a categoria
        cursor.execute("""
            UPDATE categoria
            SET nome = ?, descricao = ?
            WHERE id_categoria = ?
        """, (nome, descricao or None, id_categoria))

        conexao.commit()

        return jsonify({
            "mensagem": "Categoria atualizada com sucesso."
        }), 200

    except Exception as erro:

        conexao.rollback()

        print("Erro ao editar categoria:", erro)

        return jsonify({
            "erro": "Não foi possível editar a categoria."
        }), 500

    finally:
        cursor.close()
        conexao.close()

# ==========================================
# EXCLUIR CATEGORIA
# ==========================================

@categorias_bp.route("/api/categorias/<int:id_categoria>", methods=["DELETE"])
def excluir_categoria(id_categoria):

    conexao = conectar_banco()
    cursor = conexao.cursor()

    try:

        # Verifica se a categoria existe
        cursor.execute("""
            SELECT id_categoria
            FROM categoria
            WHERE id_categoria = ?
        """, (id_categoria,))

        if not cursor.fetchone():
            return jsonify({
                "erro": "Categoria não encontrada."
            }), 404

        # Verifica se existem produtos vinculados
        cursor.execute("""
            SELECT id_produto
            FROM produto
            WHERE id_categoria = ?
        """, (id_categoria,))

        if cursor.fetchone():
            return jsonify({
                "erro": "Não é possível excluir uma categoria que possui produtos vinculados."
            }), 409

        # Exclui a categoria
        cursor.execute("""
            DELETE FROM categoria
            WHERE id_categoria = ?
        """, (id_categoria,))

        conexao.commit()

        return jsonify({
            "mensagem": "Categoria excluída com sucesso."
        }), 200

    except Exception as erro:

        conexao.rollback()

        print("Erro ao excluir categoria:", erro)

        return jsonify({
            "erro": "Não foi possível excluir a categoria."
        }), 500

    finally:
        cursor.close()
        conexao.close()