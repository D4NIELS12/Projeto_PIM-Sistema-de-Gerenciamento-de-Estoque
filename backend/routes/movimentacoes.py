
from flask import Blueprint, jsonify, request
from database.conexao import conectar_banco
<<<<<<< HEAD
from integracao_c import validar_quantidade
=======
>>>>>>> da2339c476046f8e88f086822c63c7947fe7527d

movimentacoes_bp = Blueprint("movimentacoes", __name__)


# ==========================================
# AJUSTAR ESTOQUE
# ==========================================

@movimentacoes_bp.route(
    "/api/estoque/<int:id_produto>/ajuste",
    methods=["POST"]
)
def ajustar_estoque(id_produto):

    dados = request.get_json(silent=True)

    if not isinstance(dados, dict):
        return jsonify({
            "erro": "Dados inválidos."
        }), 400

    quantidade_nova = dados.get("quantidade_nova")
    motivo = dados.get("motivo")

    # Valida a quantidade informada
    if (
        isinstance(quantidade_nova, bool)
        or not isinstance(quantidade_nova, int)
        or quantidade_nova < 0
        or quantidade_nova > 2147483647
    ):
        return jsonify({
            "erro": "Informe uma quantidade inteira válida e não negativa."
        }), 400

<<<<<<< HEAD
        # Validação complementar utilizando o módulo C
        if not validar_quantidade(quantidade):
            return jsonify({
                "erro": "O módulo C rejeitou a quantidade informada."
        }), 400

=======
>>>>>>> da2339c476046f8e88f086822c63c7947fe7527d
    # Valida o motivo
    if not isinstance(motivo, str) or not motivo.strip():
        return jsonify({
            "erro": "Informe o motivo do ajuste."
        }), 400

    motivo = motivo.strip()

    if len(motivo) > 150:
        return jsonify({
            "erro": "O motivo deve possuir no máximo 150 caracteres."
        }), 400

    conexao = conectar_banco()
    cursor = conexao.cursor()

    try:

        # Busca o estoque atual e bloqueia a linha
        # durante a operação para evitar alterações simultâneas.
        cursor.execute("""
            SELECT
                e.id_estoque,
                e.quantidade_atual
            FROM estoque e WITH (UPDLOCK, ROWLOCK)
            INNER JOIN produto p
                ON p.id_produto = e.id_produto
            WHERE p.id_produto = ?
              AND p.ativo = 1
        """, (id_produto,))

        estoque = cursor.fetchone()

        if not estoque:
            return jsonify({
                "erro": "Produto não encontrado."
            }), 404

        id_estoque = estoque[0]
        quantidade_anterior = int(estoque[1])

        # Calcula a diferença entre as quantidades
        diferenca = quantidade_nova - quantidade_anterior

        if diferenca == 0:
            return jsonify({
                "erro": "A nova quantidade é igual ao estoque atual."
            }), 400

        # Atualiza a quantidade no estoque
        cursor.execute("""
            UPDATE estoque
            SET quantidade_atual = ?
            WHERE id_estoque = ?
        """, (quantidade_nova, id_estoque))

        # Registra o histórico da movimentação
        cursor.execute("""
            INSERT INTO movimentacao_estoque (
                id_estoque,
                tipo,
                quantidade,
                motivo,
                quantidade_anterior,
                quantidade_posterior
            )
            VALUES (?, 'ajuste', ?, ?, ?, ?)
        """, (
            id_estoque,
            abs(diferenca),
            motivo,
            quantidade_anterior,
            quantidade_nova
        ))

        conexao.commit()

        return jsonify({
            "mensagem": "Estoque ajustado com sucesso.",
            "quantidade_anterior": quantidade_anterior,
            "quantidade_posterior": quantidade_nova,
            "diferenca": diferenca
        }), 200

    except Exception as erro:

        conexao.rollback()

        print(f"Erro ao ajustar estoque: {erro}")

        return jsonify({
            "erro": "Não foi possível realizar o ajuste de estoque."
        }), 500

    finally:
        cursor.close()
        conexao.close()
        

# ==========================================
# REGISTRAR ENTRADA DE ESTOQUE
# ==========================================

@movimentacoes_bp.route(
    "/api/estoque/<int:id_produto>/entrada",
    methods=["POST"]
)
def registrar_entrada(id_produto):

    dados = request.get_json(silent=True)

    if not isinstance(dados, dict):
        return jsonify({
            "erro": "Dados inválidos."
        }), 400

    quantidade = dados.get("quantidade")
    motivo = dados.get("motivo")

    # Valida a quantidade recebida
    if (
        isinstance(quantidade, bool)
        or not isinstance(quantidade, int)
        or quantidade <= 0
        or quantidade > 2147483647
    ):
        return jsonify({
            "erro": "Informe uma quantidade inteira maior que zero."
        }), 400

    # Valida o motivo
    if not isinstance(motivo, str) or not motivo.strip():
        return jsonify({
            "erro": "Informe o motivo da entrada."
        }), 400

    motivo = motivo.strip()

    if len(motivo) > 150:
        return jsonify({
            "erro": "O motivo deve possuir no máximo 150 caracteres."
        }), 400

    conexao = conectar_banco()
    cursor = conexao.cursor()

    try:

        # Busca o estoque atual e bloqueia a linha
        cursor.execute("""
            SELECT
                e.id_estoque,
                e.quantidade_atual
            FROM estoque e WITH (UPDLOCK, ROWLOCK)
            INNER JOIN produto p
                ON p.id_produto = e.id_produto
            WHERE p.id_produto = ?
              AND p.ativo = 1
        """, (id_produto,))

        estoque = cursor.fetchone()

        if not estoque:
            return jsonify({
                "erro": "Produto não encontrado."
            }), 404

        id_estoque = estoque[0]
        quantidade_anterior = int(estoque[1])

        # Calcula a nova quantidade
        quantidade_posterior = quantidade_anterior + quantidade

        if quantidade_posterior > 2147483647:
            return jsonify({
                "erro": "A quantidade ultrapassa o limite permitido."
            }), 400

        # Atualiza o estoque
        cursor.execute("""
            UPDATE estoque
            SET quantidade_atual = ?
            WHERE id_estoque = ?
        """, (quantidade_posterior, id_estoque))

        # Registra a entrada no histórico
        cursor.execute("""
            INSERT INTO movimentacao_estoque (
                id_estoque,
                tipo,
                quantidade,
                motivo,
                quantidade_anterior,
                quantidade_posterior
            )
            VALUES (?, 'entrada', ?, ?, ?, ?)
        """, (
            id_estoque,
            quantidade,
            motivo,
            quantidade_anterior,
            quantidade_posterior
        ))

        conexao.commit()

        return jsonify({
            "mensagem": "Entrada registrada com sucesso.",
            "quantidade_anterior": quantidade_anterior,
            "quantidade_adicionada": quantidade,
            "quantidade_posterior": quantidade_posterior
        }), 201

    except Exception as erro:

        conexao.rollback()

        print(f"Erro ao registrar entrada: {erro}")

        return jsonify({
            "erro": "Não foi possível registrar a entrada."
        }), 500

    finally:
        cursor.close()
        conexao.close()


# ==========================================
# LISTAR HISTORICO DE MOVIMENTACOES
# ==========================================

@movimentacoes_bp.route(
    "/api/movimentacoes",
    methods=["GET"]
)
def listar_movimentacoes():

    conexao = conectar_banco()
    cursor = conexao.cursor()

    try:

        cursor.execute("""
            SELECT
                me.id_movimentacao,
                p.id_produto,
                p.nome AS produto,
                p.codigo,
                me.tipo,
                me.quantidade,
                me.quantidade_anterior,
                me.quantidade_posterior,
                me.motivo,
                me.data_movimentacao

            FROM movimentacao_estoque me

            INNER JOIN estoque e
                ON me.id_estoque = e.id_estoque

            INNER JOIN produto p
                ON e.id_produto = p.id_produto

            ORDER BY
                me.data_movimentacao DESC,
                me.id_movimentacao DESC
        """)

        movimentacoes = cursor.fetchall()

        resultado = []

        for linha in movimentacoes:

            resultado.append({
                "id": linha[0],
                "id_produto": linha[1],
                "produto": linha[2],
                "codigo": linha[3],
                "tipo": linha[4],
                "quantidade": linha[5],
                "quantidade_anterior": linha[6],
                "quantidade_posterior": linha[7],
                "motivo": linha[8],
                "data_movimentacao": (
                    linha[9].isoformat(sep=" ", timespec="seconds")
                    if linha[9] else None
                )
            })

        return jsonify(resultado), 200

    except Exception as erro:

        print(f"Erro ao listar movimentacoes: {erro}")

        return jsonify({
            "erro": "Não foi possível carregar o histórico."
        }), 500

    finally:

        cursor.close()
        conexao.close()