import pyodbc

try:
    conexao = pyodbc.connect(
        "DRIVER={ODBC Driver 18 for SQL Server};"
        "SERVER=localhost\\SQLEXPRESS;"
        "DATABASE=PIM_Oficina_Estoque;"
        "Trusted_Connection=yes;"
        "TrustServerCertificate=yes;"
    )

    print("Conexão com o banco realizada com sucesso!")

    cursor = conexao.cursor()

    cursor.execute("SELECT nome FROM produto")

    produtos = cursor.fetchall()

    print("\nProdutos cadastrados:")

    for produto in produtos:
        print(produto[0])

    conexao.close()

except Exception as erro:
    print("Erro ao conectar ao banco:")
    print(erro)