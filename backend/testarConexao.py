import pyodbc

try:
    conexao = pyodbc.connect(
        "Driver={ODBC Driver 18 for SQL Server};"
        "Server=localhost\\SQLEXPRESS;"
        "Database=PIM_Oficina_Estoque;"
        "Trusted_Connection=yes;"
        "TrustServerCertificate=yes;"
    )

    print("Conexão com o banco realizada com sucesso!")

    cursor = conexao.cursor()

    cursor.execute("""
        SELECT TABLE_NAME
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_TYPE = 'BASE TABLE'
    """)

    tabelas = cursor.fetchall()

    print("\nTabelas encontradas no banco:")

    for tabela in tabelas:
        print("-", tabela[0])

except Exception as erro:
    print("Erro ao conectar ao banco:")
    print(erro)

finally:
    if 'conexao' in locals():
        conexao.close()