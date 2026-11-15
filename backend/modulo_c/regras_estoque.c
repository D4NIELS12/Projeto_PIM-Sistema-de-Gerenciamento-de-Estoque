#include <stdio.h>

// Verifica se o estoque atingiu o limite minimo
int verificar_estoque(int quantidade, int quantidade_min) {
    if (quantidade <= quantidade_min) {
        return 1;
    }

    return 0;
}

// Verifica se a quantidade informada e valida
int validar_quantidade(int quantidade) {
    if (quantidade > 0) {
        return 1;
    }

    return 0;
}