from flask import Blueprint, jsonify, request
from database.conexao import conectar_banco

from decimal import Decimal

vendas_bp = Blueprint("vendas", __name__)

@vendas_bp.route("/api/vendas", methods=["POST"])
def registrar_venda():

    dados = request.get_json(silent=True)

    if not isinstance(dados, dict) or not isinstance(dados.get("itens"), list):
        return jsonify({"erro": "Dados da venda inválidos."}), 400

    itens = dados["itens"]

    if not itens:
        return jsonify({"erro": "Adicione pelo menos um produto."}), 400

    # Junta quantidades de produtos repetidos
    quantidades = {}

    for item in itens:

        if not isinstance(item, dict):
            return jsonify({"erro": "Item inválido."}), 400

        id_produto = item.get("id_produto")
        quantidade = item.get("quantidade")

        if not isinstance(id_produto, int) or isinstance(id_produto, bool) or id_produto <= 0:
            return jsonify({"erro": "Produto inválido."}), 400

        if not isinstance(quantidade, int) or isinstance(quantidade, bool) or quantidade <= 0:
            return jsonify({"erro": "Quantidade inválida."}), 400

        quantidades[id_produto] = quantidades.get(id_produto, 0) + quantidade

    conexao = conectar_banco()
    cursor = conexao.cursor()

    try:
        valor_total = Decimal("0.00")
        itens_processados = []

        # Consulta os produtos e verifica o estoque
        for id_produto, quantidade in quantidades.items():

            cursor.execute("""
                SELECT
                    p.nome,
                    p.preco_venda,
                    e.id_estoque,
                    e.quantidade_atual
                FROM produto p
                INNER JOIN estoque e WITH (UPDLOCK, ROWLOCK)
                    ON p.id_produto = e.id_produto
                WHERE p.id_produto = ?
                AND p.ativo = 1
            """, (id_produto,))

            produto = cursor.fetchone()

            if not produto:
                return jsonify({"erro": f"Produto {id_produto} não encontrado."}), 404

            if produto[3] < quantidade:
                return jsonify({
                    "erro": f"Estoque insuficiente para {produto[0]}."
                }), 400

            preco = produto[1]
            estoque_anterior = produto[3]

            valor_total += preco * quantidade

            itens_processados.append({
                "id_produto": id_produto,
                "id_estoque": produto[2],
                "quantidade": quantidade,
                "preco": preco,
                "estoque_anterior": estoque_anterior
            })

        # Registra a venda
        cursor.execute("""
            INSERT INTO venda (valor_total)
            OUTPUT INSERTED.id_venda
            VALUES (?)
        """, (valor_total,))

        id_venda = cursor.fetchone()[0]

        # Registra os produtos e atualiza o estoque
        for item in itens_processados:

            estoque_novo = item["estoque_anterior"] - item["quantidade"]

            cursor.execute("""
                INSERT INTO item_venda (
                    id_venda, id_produto, quantidade, preco_unitario
                )
                VALUES (?, ?, ?, ?)
            """, (
                id_venda,
                item["id_produto"],
                item["quantidade"],
                item["preco"]
            ))

            cursor.execute("""
                UPDATE estoque
                SET quantidade_atual = ?
                WHERE id_estoque = ?
            """, (estoque_novo, item["id_estoque"]))

            cursor.execute("""
                INSERT INTO movimentacao_estoque (
                    id_estoque, id_venda, tipo, quantidade,
                    motivo, quantidade_anterior, quantidade_posterior
                )
                VALUES (?, ?, 'saida', ?, 'Venda de produto', ?, ?)
            """, (
                item["id_estoque"],
                id_venda,
                item["quantidade"],
                item["estoque_anterior"],
                estoque_novo
            ))

        conexao.commit()

        return jsonify({
            "mensagem": "Venda registrada com sucesso!",
            "id_venda": id_venda,
            "valor_total": float(valor_total)
        }), 201

    except Exception as erro:
        conexao.rollback()
        return jsonify({"erro": str(erro)}), 500

    finally:
        cursor.close()
        conexao.close()