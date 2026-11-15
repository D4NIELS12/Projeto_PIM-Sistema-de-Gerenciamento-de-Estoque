import pyodbc

def conectar_banco():
    conexao = pyodbc.connect(
        "DRIVER={ODBC Driver 18 for SQL Server};"
        "SERVER=localhost\\SQLEXPRESS;"
        "DATABASE=PIM_Oficina_Estoque;"
        "Trusted_Connection=yes;"
        "TrustServerCertificate=yes;"
    )

    return conexao