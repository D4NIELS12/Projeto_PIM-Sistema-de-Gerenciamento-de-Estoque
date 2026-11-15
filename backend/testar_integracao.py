from integracao_c import verificar_estoque, validar_quantidade

print("===== TESTE DO MODULO C =====")

print("Estoque 3 / Minimo 5:", verificar_estoque(3, 5))
print("Estoque 5 / Minimo 5:", verificar_estoque(5, 5))
print("Estoque 10 / Minimo 5:", verificar_estoque(10, 5))

print("Quantidade 5:", validar_quantidade(5))
print("Quantidade 0:", validar_quantidade(0))