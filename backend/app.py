import os

from flask import Flask
from flask_cors import CORS

from routes.produtos import produtos_bp
from routes.indicadores import indicadores_bp
from routes.graficos import graficos_bp
from routes.movimentacoes import movimentacoes_bp
from routes.vendas import vendas_bp
from routes.fornecedores import fornecedores_bp
from routes.categorias import categorias_bp
from routes.auth import auth_bp


app = Flask(__name__)

app.secret_key = os.environ.get(
    "FLASK_SECRET_KEY",
    "autoflow-chave-temporaria-desenvolvimento"
)

CORS(app, origins=["http://127.0.0.1:5500"], supports_credentials=True)

app.register_blueprint(produtos_bp)
app.register_blueprint(indicadores_bp)
app.register_blueprint(graficos_bp)
app.register_blueprint(movimentacoes_bp)
app.register_blueprint(vendas_bp)
app.register_blueprint(fornecedores_bp)
app.register_blueprint(categorias_bp)
app.register_blueprint(auth_bp)


if __name__ == "__main__":
    app.run(debug=True)