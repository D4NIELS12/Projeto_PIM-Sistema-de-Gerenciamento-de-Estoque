from flask import Flask
from flask_cors import CORS

from routes.produtos import produtos_bp
from routes.indicadores import indicadores_bp
from routes.graficos import graficos_bp


app = Flask(__name__)

CORS(app, origins=["http://127.0.0.1:5500"])

app.register_blueprint(produtos_bp)
app.register_blueprint(indicadores_bp)
app.register_blueprint(graficos_bp)


if __name__ == "__main__":
    app.run(debug=True)