
from flask import Blueprint, jsonify, request
from database.conexao import conectar_banco
from integracao_c import verificar_estoque

from decimal import Decimal, InvalidOperation

produtos_bp = Blueprint("produtos", __name__)


# ==========================================
# LISTAR PRODUTOS
# ==========================================

@produtos_bp.route("/api/produtos", methods=["GET"])
def listar_produtos():
    conexao = conectar_banco()
    cursor = conexao.cursor()

    try:
        cursor.execute("""
            SELECT p.id_produto, p.codigo, p.nome, p.id_categoria,
                   p.id_fornecedor, c.nome AS categoria, f.nome AS fornecedor,
                   p.preco_custo, p.preco_venda, p.descricao,
                   e.quantidade_atual, e.quantidade_min
            FROM produto p
            INNER JOIN categoria c ON p.id_categoria = c.id_categoria
            LEFT JOIN fornecedor f ON p.id_fornecedor = f.id_fornecedor
            INNER JOIN estoque e ON p.id_produto = e.id_produto
            WHERE p.ativo = 1
        """)

        resultados = cursor.fetchall()
        produtos = []

        for linha in resultados:
            estoque_baixo = verificar_estoque(
                int(linha[10]),
                int(linha[11])
            )

            produtos.append({
                "id": linha[0],
                "codigo": linha[1],
                "nome": linha[2],
                "id_categoria": linha[3],
                "id_fornecedor": linha[4],
                "categoria": linha[5],
                "fornecedor": linha[6],
                "preco_custo": float(linha[7]),
                "preco": float(linha[8]),
                "descricao": linha[9],
                "quantidade": linha[10],
                "quantidade_minima": linha[11],
                "estoque_baixo": bool(estoque_baixo)
            })

        return jsonify(produtos)

    finally:
        cursor.close()
        conexao.close()


# ==========================================
# CADASTRAR PRODUTO
# ==========================================

@produtos_bp.route("/api/produtos", methods=["POST"])
def cadastrar_produto():

    dados = request.get_json(silent=True)

    if not isinstance(dados, dict):
        return jsonify({"erro": "Dados inválidos."}), 400

    try:
        codigo = str(dados.get("codigo", "")).strip()
        nome = str(dados.get("nome", "")).strip()
        descricao = str(dados.get("descricao") or "").strip()

        id_categoria = int(dados.get("id_categoria"))
        id_fornecedor = dados.get("id_fornecedor")

        if id_fornecedor in ("", None):
            id_fornecedor = None
        else:
            id_fornecedor = int(id_fornecedor)

        preco_custo = Decimal(str(dados.get("preco_custo")))
        preco_venda = Decimal(str(dados.get("preco_venda")))

        quantidade = int(dados.get("quantidade"))
        quantidade_minima = int(dados.get("quantidade_minima"))

        if not codigo or not nome:
            return jsonify({
                "erro": "Código e nome são obrigatórios."
            }), 400

        if len(codigo) > 30 or len(nome) > 150 or len(descricao) > 250:
            return jsonify({
                "erro": "Um dos campos de texto ultrapassou o limite permitido."
            }), 400

        if id_categoria <= 0 or (id_fornecedor is not None and id_fornecedor <= 0):
            return jsonify({
                "erro": "Categoria ou fornecedor inválido."
            }), 400

        if (
            not preco_custo.is_finite()
            or not preco_venda.is_finite()
            or preco_custo < 0
            or preco_venda < 0
        ):
            return jsonify({
                "erro": "Os preços devem ser valores válidos e não negativos."
            }), 400

        if (
            quantidade < 0
            or quantidade_minima < 0
            or quantidade > 2147483647
            or quantidade_minima > 2147483647
        ):
            return jsonify({
                "erro": "As quantidades informadas são inválidas."
            }), 400
            
        if preco_custo > Decimal("99999999.99") or preco_venda > Decimal("99999999.99"):
            return jsonify({
                "erro": "O preço informado ultrapassa o limite permitido."
            }), 400

    except (ValueError, TypeError, InvalidOperation):
        return jsonify({
            "erro": "Verifique os valores informados."
        }), 400

    conexao = conectar_banco()
    cursor = conexao.cursor()

    try:
        # Verifica se o código já está cadastrado
        cursor.execute("""
            SELECT id_produto
            FROM produto
            WHERE codigo = ?
        """, (codigo,))

        produto_existente = cursor.fetchone()

        if produto_existente:
            return jsonify({
                "erro": "Já existe um produto cadastrado com esse código."
            }), 409

        
        # Insere o produto e recupera seu ID
        cursor.execute("""
            INSERT INTO produto (
                id_categoria,
                id_fornecedor,
                codigo,
                nome,
                descricao,
                preco_custo,
                preco_venda
            )
            OUTPUT INSERTED.id_produto
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            id_categoria,
            id_fornecedor,
            codigo,
            nome,
            descricao or None,
            preco_custo,
            preco_venda
        ))

        id_produto = cursor.fetchone()[0]

        # Cria o registro de estoque relacionado ao produto
        cursor.execute("""
            INSERT INTO estoque (
                id_produto,
                quantidade_atual,
                quantidade_min
            )
            VALUES (?, ?, ?)
        """, (
            id_produto,
            quantidade,
            quantidade_minima
        ))

        # Confirma as duas operações
        conexao.commit()

        return jsonify({
            "mensagem": "Produto cadastrado com sucesso.",
            "id_produto": id_produto
        }), 201

    except Exception as erro:
        conexao.rollback()
        print("Erro ao cadastrar produto:", erro)

        return jsonify({
            "erro": "Não foi possível cadastrar o produto. Verifique os dados."
        }), 500

    finally:
        cursor.close()
        conexao.close()
        
    
    
# ==========================================
# EDITAR PRODUTO
# ==========================================

@produtos_bp.route("/api/produtos/<int:id_produto>", methods=["PUT"])
def editar_produto(id_produto):

    dados = request.get_json(silent=True)

    if not isinstance(dados, dict):
        return jsonify({"erro": "Dados inválidos."}), 400

    try:
        codigo = str(dados.get("codigo", "")).strip()
        nome = str(dados.get("nome", "")).strip()
        descricao = str(dados.get("descricao") or "").strip()

        id_categoria = int(dados.get("id_categoria"))

        id_fornecedor = dados.get("id_fornecedor")
        if id_fornecedor in ("", None):
            id_fornecedor = None
        else:
            id_fornecedor = int(id_fornecedor)

        preco_custo = Decimal(str(dados.get("preco_custo")))
        preco_venda = Decimal(str(dados.get("preco_venda")))
        quantidade_minima = int(dados.get("quantidade_minima"))

        if not codigo or not nome:
            return jsonify({"erro": "Código e nome são obrigatórios."}), 400

        if len(codigo) > 30 or len(nome) > 150 or len(descricao) > 250:
            return jsonify({"erro": "Um dos campos de texto ultrapassou o limite permitido."}), 400

        if id_categoria <= 0 or (id_fornecedor is not None and id_fornecedor <= 0):
            return jsonify({"erro": "Categoria ou fornecedor inválido."}), 400

        if (
            not preco_custo.is_finite()
            or not preco_venda.is_finite()
            or preco_custo < 0
            or preco_venda < 0
            or preco_custo > Decimal("99999999.99")
            or preco_venda > Decimal("99999999.99")
        ):
            return jsonify({"erro": "Os preços informados são inválidos."}), 400

        if quantidade_minima < 0 or quantidade_minima > 2147483647:
            return jsonify({"erro": "Estoque mínimo inválido."}), 400

    except (ValueError, TypeError, InvalidOperation):
        return jsonify({"erro": "Verifique os valores informados."}), 400

    conexao = conectar_banco()
    cursor = conexao.cursor()

    try:
        cursor.execute("""
            SELECT id_produto
            FROM produto
            WHERE id_produto = ? AND ativo = 1
        """, (id_produto,))

        if not cursor.fetchone():
            return jsonify({"erro": "Produto não encontrado."}), 404

        cursor.execute("""
            SELECT id_produto
            FROM produto
            WHERE codigo = ? AND id_produto <> ?
        """, (codigo, id_produto))

        if cursor.fetchone():
            return jsonify({
                "erro": "Já existe outro produto cadastrado com esse código."
            }), 409

        cursor.execute("""
            UPDATE produto
            SET codigo = ?,
                nome = ?,
                descricao = ?,
                id_categoria = ?,
                id_fornecedor = ?,
                preco_custo = ?,
                preco_venda = ?
            WHERE id_produto = ? AND ativo = 1
        """, (
            codigo,
            nome,
            descricao or None,
            id_categoria,
            id_fornecedor,
            preco_custo,
            preco_venda,
            id_produto
        ))

        cursor.execute("""
            UPDATE estoque
            SET quantidade_min = ?
            WHERE id_produto = ?
        """, (quantidade_minima, id_produto))

        conexao.commit()

        return jsonify({
            "mensagem": "Produto atualizado com sucesso."
        }), 200

    except Exception as erro:
        conexao.rollback()
        print("Erro ao editar produto:", erro)

        return jsonify({
            "erro": "Não foi possível atualizar o produto."
        }), 500

    finally:
        cursor.close()
        conexao.close()


# ==========================================
# EXCLUIR PRODUTO (EXCLUSÃO LÓGICA)
# ==========================================

@produtos_bp.route("/api/produtos/<int:id_produto>", methods=["DELETE"])
def excluir_produto(id_produto):

    conexao = conectar_banco()
    cursor = conexao.cursor()

    try:
        cursor.execute("""
            UPDATE produto
            SET ativo = 0
            WHERE id_produto = ? AND ativo = 1
        """, (id_produto,))

        if cursor.rowcount == 0:
            return jsonify({
                "erro": "Produto não encontrado ou já excluído."
            }), 404

        conexao.commit()

        return jsonify({
            "mensagem": "Produto excluído com sucesso."
        }), 200

    except Exception as erro:
        conexao.rollback()
        print("Erro ao excluir produto:", erro)

        return jsonify({
            "erro": "Não foi possível excluir o produto."
        }), 500

    finally:
        cursor.close()
        conexao.close()

        
# ==========================================
# LISTAR CATEGORIAS
# ==========================================

@produtos_bp.route("/api/categorias", methods=["GET"])
def listar_categorias():
    conexao = conectar_banco()
    cursor = conexao.cursor()

    try:
        cursor.execute("""
            SELECT id_categoria, nome
            FROM categoria
            ORDER BY nome
        """)

        resultados = cursor.fetchall()

        categorias = [
            {
                "id": linha[0],
                "nome": linha[1]
            }
            for linha in resultados
        ]

        return jsonify(categorias)

    finally:
        cursor.close()
        conexao.close()


# ==========================================
# LISTAR FORNECEDORES
# ==========================================

@produtos_bp.route("/api/fornecedores", methods=["GET"])
def listar_fornecedores():
    conexao = conectar_banco()
    cursor = conexao.cursor()

    try:
        cursor.execute("""
            SELECT id_fornecedor, nome
            FROM fornecedor
            ORDER BY nome
        """)

        resultados = cursor.fetchall()

        fornecedores = [
            {
                "id": linha[0],
                "nome": linha[1]
            }
            for linha in resultados
        ]

        return jsonify(fornecedores)

    finally:
        cursor.close()
        conexao.close()
