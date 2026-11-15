from flask import Blueprint, jsonify, request
from database.conexao import conectar_banco

indicadores_bp = Blueprint("indicadores", __name__)

@indicadores_bp.route("/api/indicadores", methods=["GET"])
def obter_indicadores():
    periodo = request.args.get("periodo", "6meses")

    if periodo not in ["30dias", "6meses", "ano"]:
        periodo = "6meses"

    conexao = conectar_banco()
    cursor = conexao.cursor()

    try:
        cursor.execute("""
            SELECT ISNULL(SUM(valor_total), 0), COUNT(*)
            FROM venda
            WHERE status = 'concluida'
            AND data_venda >= CASE ?
                WHEN '30dias' THEN DATEADD(DAY, -30, SYSDATETIME())
                WHEN '6meses' THEN DATEADD(MONTH, -6, SYSDATETIME())
                WHEN 'ano' THEN DATEFROMPARTS(YEAR(GETDATE()), 1, 1)
            END
        """, periodo)

        resultado_vendas = cursor.fetchone()

        total_vendas = float(resultado_vendas[0])
        quantidade_vendas = resultado_vendas[1]

        cursor.execute("""
            SELECT COUNT(*)
            FROM produto
            WHERE ativo = 1
        """)

        total_produtos = cursor.fetchone()[0]

        cursor.execute("""
            SELECT ISNULL(SUM(e.quantidade_atual * p.preco_custo), 0)
            FROM estoque e
            INNER JOIN produto p ON e.id_produto = p.id_produto
            WHERE p.ativo = 1
        """)

        valor_estoque = float(cursor.fetchone()[0])

        return jsonify({
            "vendas_periodo": total_vendas,
            "quantidade_vendas": quantidade_vendas,
            "total_produtos": total_produtos,
            "valor_estoque": valor_estoque
        })

    finally:
        cursor.close()
        conexao.close()