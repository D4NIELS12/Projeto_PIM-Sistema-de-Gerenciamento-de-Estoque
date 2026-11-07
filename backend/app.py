from flask import Flask, jsonify
from flask_cors import CORS
from flask import request
import pyodbc

app = Flask(__name__)

CORS(app, origins=["http://127.0.0.1:5500"])


def conectar_banco():
    conexao = pyodbc.connect(
        "DRIVER={ODBC Driver 18 for SQL Server};"
        "SERVER=localhost\\SQLEXPRESS;"
        "DATABASE=PIM_Oficina_Estoque;"
        "Trusted_Connection=yes;"
        "TrustServerCertificate=yes;"
    )

    return conexao


@app.route("/api/produtos", methods=["GET"])
def listar_produtos():

    conexao = conectar_banco()
    cursor = conexao.cursor()

    cursor.execute("""
        SELECT
            p.id_produto,
            p.codigo,
            p.nome,
            c.nome AS categoria,
            f.nome AS fornecedor,
            p.preco_venda,
            e.quantidade_atual,
            e.quantidade_min
        FROM produto p
        INNER JOIN categoria c
            ON p.id_categoria = c.id_categoria
        LEFT JOIN fornecedor f
            ON p.id_fornecedor = f.id_fornecedor
        INNER JOIN estoque e
            ON p.id_produto = e.id_produto
    """)

    resultados = cursor.fetchall()

    produtos = []

    for linha in resultados:
        produtos.append({
            "id": linha[0],
            "codigo": linha[1],
            "nome": linha[2],
            "categoria": linha[3],
            "fornecedor": linha[4],
            "preco": float(linha[5]),
            "quantidade": linha[6],
            "quantidade_minima": linha[7]
        })

    cursor.close()
    conexao.close()

    return jsonify(produtos)


@app.route("/api/indicadores", methods=["GET"])
def obter_indicadores():

    periodo = request.args.get("periodo", "6meses")

    if periodo not in ["30dias", "6meses", "ano"]:
        periodo = "6meses"

    conexao = conectar_banco()
    cursor = conexao.cursor()

    try:
        # Vendas concluídas no período selecionado
        cursor.execute("""
            SELECT
                ISNULL(SUM(valor_total), 0),
                COUNT(*)
            FROM venda
            WHERE status = 'concluida'
            AND data_venda >=
                CASE ?
                    WHEN '30dias' THEN DATEADD(DAY, -30, SYSDATETIME())
                    WHEN '6meses' THEN DATEADD(MONTH, -6, SYSDATETIME())
                    WHEN 'ano' THEN DATEFROMPARTS(YEAR(GETDATE()), 1, 1)
                END
        """, periodo)

        resultado_vendas = cursor.fetchone()

        total_vendas = float(resultado_vendas[0])
        quantidade_vendas = resultado_vendas[1]

        # Quantidade de produtos ativos
        cursor.execute("""
            SELECT COUNT(*)
            FROM produto
            WHERE ativo = 1
        """)

        total_produtos = cursor.fetchone()[0]

        # Valor total do estoque pelo preço de custo
        cursor.execute("""
            SELECT
                ISNULL(SUM(e.quantidade_atual * p.preco_custo), 0)
            FROM estoque e
            INNER JOIN produto p
                ON e.id_produto = p.id_produto
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


@app.route("/api/graficos", methods=["GET"])
def obter_graficos():
    periodo = request.args.get("periodo", "6meses")

    if periodo not in ["30dias", "6meses", "ano"]:
        periodo = "6meses"

    conexao = conectar_banco()
    cursor = conexao.cursor()

    try:

        # =================================
        # 1. VENDAS POR PERÍODO
        # =================================

        if periodo == "30dias":

            cursor.execute("""
                SELECT
                    DATEDIFF(
                        DAY,
                        CAST(data_venda AS DATE),
                        CAST(GETDATE() AS DATE)
                    ) / 7 AS semana,
                    SUM(valor_total) AS total
                FROM venda
                WHERE status = 'concluida'
                  AND data_venda >= DATEADD(DAY, -30, SYSDATETIME())
                GROUP BY
                    DATEDIFF(
                        DAY,
                        CAST(data_venda AS DATE),
                        CAST(GETDATE() AS DATE)
                    ) / 7
            """)

            resultados = cursor.fetchall()

            # Cria cinco semanas, mesmo que alguma não tenha vendas
            vendas_por_semana = {
                semana: 0 for semana in range(5)
            }

            for linha in resultados:
                semana = linha[0]

                if semana in vendas_por_semana:
                    vendas_por_semana[semana] = float(linha[1])

            labels_vendas = [
                "Semana 1",
                "Semana 2",
                "Semana 3",
                "Semana 4",
                "Semana 5"
            ]

            valores_vendas = [
                vendas_por_semana[4],
                vendas_por_semana[3],
                vendas_por_semana[2],
                vendas_por_semana[1],
                vendas_por_semana[0]
            ]

        elif periodo == "6meses":

            cursor.execute("""
                SELECT
                    YEAR(data_venda) AS ano,
                    MONTH(data_venda) AS mes,
                    SUM(valor_total) AS total
                FROM venda
                WHERE status = 'concluida'
                  AND data_venda >= DATEADD(MONTH, -6, SYSDATETIME())
                GROUP BY YEAR(data_venda), MONTH(data_venda)
                ORDER BY ano, mes
            """)

            resultados = cursor.fetchall()

            meses = [
                "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
                "Jul", "Ago", "Set", "Out", "Nov", "Dez"
            ]

            labels_vendas = []
            valores_vendas = []

            for linha in resultados:
                ano = linha[0]
                mes = linha[1]

                labels_vendas.append(
                    f"{meses[mes - 1]}/{ano}"
                )

                valores_vendas.append(float(linha[2]))

        else:

            cursor.execute("""
                SELECT
                    MONTH(data_venda) AS mes,
                    SUM(valor_total) AS total
                FROM venda
                WHERE status = 'concluida'
                  AND YEAR(data_venda) = YEAR(GETDATE())
                GROUP BY MONTH(data_venda)
            """)

            resultados = cursor.fetchall()

            meses = [
                "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
                "Jul", "Ago", "Set", "Out", "Nov", "Dez"
            ]

            vendas_por_mes = {
                mes: 0 for mes in range(1, 13)
            }

            for linha in resultados:
                vendas_por_mes[linha[0]] = float(linha[1])

            labels_vendas = meses

            valores_vendas = [
                vendas_por_mes[mes]
                for mes in range(1, 13)
            ]

        # =================================
        # 2. VENDAS POR CATEGORIA
        # =================================

        cursor.execute("""
            SELECT
                c.nome,
                ISNULL(
                    SUM(
                        CASE
                            WHEN v.id_venda IS NOT NULL
                            THEN iv.subtotal
                            ELSE 0
                        END
                    ), 0
                ) AS total
            FROM categoria c

            LEFT JOIN produto p
                ON p.id_categoria = c.id_categoria

            LEFT JOIN item_venda iv
                ON iv.id_produto = p.id_produto

            LEFT JOIN venda v
                ON v.id_venda = iv.id_venda
                AND v.status = 'concluida'
                AND v.data_venda >=
                    CASE ?
                        WHEN '30dias'
                            THEN DATEADD(DAY, -30, SYSDATETIME())
                        WHEN '6meses'
                            THEN DATEADD(MONTH, -6, SYSDATETIME())
                        WHEN 'ano'
                            THEN DATEFROMPARTS(
                                YEAR(GETDATE()), 1, 1
                            )
                    END

            GROUP BY c.nome
            ORDER BY c.nome
        """, periodo)

        resultados_categorias = cursor.fetchall()

        labels_categorias = []
        valores_categorias = []

        for linha in resultados_categorias:
            labels_categorias.append(linha[0])
            valores_categorias.append(float(linha[1]))

        # =================================
        # 3. RETORNAR OS DADOS EM JSON
        # =================================

        return jsonify({
            "vendas": {
                "labels": labels_vendas,
                "valores": valores_vendas
            },

            "categorias": {
                "labels": labels_categorias,
                "valores": valores_categorias
            }
        })

    finally:
        cursor.close()
        conexao.close()


if __name__ == "__main__":
    app.run(debug=True)