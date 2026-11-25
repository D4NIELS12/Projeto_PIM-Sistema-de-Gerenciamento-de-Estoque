
const API_URL = "http://127.0.0.1:5000/api/movimentacoes";

let movimentacoes = [];

// ==========================================
// CARREGAR MOVIMENTAÇÕES DA API
// ==========================================

async function carregarMovimentacoes() {
    const tabela = document.getElementById("tabelaMovimentacoes");

    try {
        const resposta = await fetch(API_URL);

        if (!resposta.ok) {
            throw new Error("Erro ao consultar a API.");
        }

        const dados = await resposta.json();

        if (!Array.isArray(dados)) {
            throw new Error("Formato de dados inválido.");
        }

        movimentacoes = dados;

        atualizarIndicadores();
        aplicarFiltros();

    } catch (erro) {
        console.error("Erro ao carregar movimentações:", erro);

        tabela.innerHTML = `
            <tr>
                <td colspan="8">
                    Não foi possível carregar as movimentações.
                </td>
            </tr>
        `;
    }
}

// ==========================================
// ATUALIZAR INDICADORES
// ==========================================

function atualizarIndicadores() {
    const entradas = movimentacoes.filter(
        movimentacao => movimentacao.tipo === "entrada"
    );

    const saidas = movimentacoes.filter(
        movimentacao => movimentacao.tipo === "saida"
    );

    const ajustes = movimentacoes.filter(
        movimentacao => movimentacao.tipo === "ajuste"
    );

    document.getElementById("totalMovimentacoes").textContent =
        movimentacoes.length;

    document.getElementById("totalEntradas").textContent =
        entradas.length;

    document.getElementById("totalSaidas").textContent =
        saidas.length;

    document.getElementById("totalAjustes").textContent =
        ajustes.length;
}

// ==========================================
// PROTEGER TEXTO EXIBIDO NA TABELA
// ==========================================

function escaparHTML(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, caractere => {
        const caracteres = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return caracteres[caractere];
    });
}

// ==========================================
// FORMATAR DATA E HORÁRIO
// ==========================================

function formatarData(data) {
    if (!data) {
        return "—";
    }

    const dataFormatada = new Date(
        String(data).replace(" ", "T")
    );

    if (isNaN(dataFormatada.getTime())) {
        return escaparHTML(data);
    }

    return dataFormatada.toLocaleString("pt-BR");
}

// ==========================================
// TRADUZIR TIPO DE MOVIMENTAÇÃO
// ==========================================

function obterTipoFormatado(tipo) {
    const tipos = {
        entrada: "Entrada",
        saida: "Saída",
        ajuste: "Ajuste"
    };

    return tipos[tipo] || tipo;
}

// ==========================================
// APLICAR FILTROS
// ==========================================

function aplicarFiltros() {
    const tabela = document.getElementById("tabelaMovimentacoes");

    const busca = document
        .getElementById("buscarMovimentacao")
        .value
        .toLowerCase()
        .trim();

    const tipoSelecionado = document.getElementById("filtroTipo").value;

    const resultado = movimentacoes.filter(movimentacao => {
        const correspondeBusca =
            String(movimentacao.produto || "").toLowerCase().includes(busca) ||
            String(movimentacao.codigo || "").toLowerCase().includes(busca) ||
            String(movimentacao.motivo || "").toLowerCase().includes(busca);

        const correspondeTipo =
            tipoSelecionado === "" ||
            movimentacao.tipo === tipoSelecionado;

        return correspondeBusca && correspondeTipo;
    });

    renderizarMovimentacoes(resultado);
}

// ==========================================
// EXIBIR MOVIMENTAÇÕES NA TABELA
// ==========================================

function renderizarMovimentacoes(lista) {
    const tabela = document.getElementById("tabelaMovimentacoes");

    if (lista.length === 0) {
        tabela.innerHTML = `
            <tr>
                <td colspan="8">
                    Nenhuma movimentação encontrada.
                </td>
            </tr>
        `;
        return;
    }

    tabela.innerHTML = lista.map(movimentacao => {
        const tipo = escaparHTML(movimentacao.tipo);

        return `
            <tr>
                <td>${escaparHTML(movimentacao.produto)}</td>

                <td>${escaparHTML(movimentacao.codigo)}</td>

                <td>
                    <span class="status-movimentacao status-${tipo}">
                        ${escaparHTML(obterTipoFormatado(movimentacao.tipo))}
                    </span>
                </td>

                <td>${escaparHTML(movimentacao.quantidade)}</td>

                <td>
                    ${movimentacao.quantidade_anterior ?? "—"}
                </td>

                <td>
                    ${movimentacao.quantidade_posterior ?? "—"}
                </td>

                <td>${escaparHTML(movimentacao.motivo || "—")}</td>

                <td>${formatarData(movimentacao.data_movimentacao)}</td>
            </tr>
        `;
    }).join("");
}

// ==========================================
// EVENTOS DOS FILTROS
// ==========================================

document
    .getElementById("buscarMovimentacao")
    .addEventListener("input", aplicarFiltros);

document
    .getElementById("filtroTipo")
    .addEventListener("change", aplicarFiltros);

// ==========================================
// INICIALIZAÇÃO
// ==========================================

carregarMovimentacoes();