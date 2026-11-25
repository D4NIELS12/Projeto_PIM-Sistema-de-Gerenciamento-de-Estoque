import ctypes
import os

caminho_dll = os.path.join(
    os.path.dirname(__file__),
    "modulo_c",
    "regras_estoque.dll"
)

biblioteca = ctypes.CDLL(caminho_dll)

# Recebe quantidade atual e quantidade mínima
biblioteca.verificar_estoque.argtypes = [
    ctypes.c_int,
    ctypes.c_int
]
biblioteca.verificar_estoque.restype = ctypes.c_int

biblioteca.validar_quantidade.argtypes = [ctypes.c_int]
biblioteca.validar_quantidade.restype = ctypes.c_int


def verificar_estoque(quantidade, quantidade_min):
    return biblioteca.verificar_estoque(
        quantidade,
        quantidade_min
    )


def validar_quantidade(quantidade):
    return biblioteca.validar_quantidade(quantidade)
