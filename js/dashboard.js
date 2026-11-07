// ==============================
// GRÁFICO DE VENDAS POR MÊS
// ==============================

const salesCanvas = document.getElementById("salesChart");

const salesChart = new Chart(salesCanvas, {
    type: "bar",

    data: {
        labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],

        datasets: [{
            label: "Vendas",
            data: [12000, 18000, 28000, 22000, 32000, 36000],
            backgroundColor: "#bf2626",
            borderRadius: 5,
            maxBarThickness: 36
        }]
    },

    options: {
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
            legend: {
                display: false
            },

            tooltip: {
                callbacks: {
                    label: function (context) {
                        return context.dataset.label + ": " +
                            context.parsed.y.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL"
                            });
                    }
                }
            }
        },

        scales: {
            y: {
                beginAtZero: true,

                ticks: {
                    callback: function (value) {
                        return "R$ " + value.toLocaleString("pt-BR");
                    }
                }
            }
        }
    }
});


// ==============================
// GRÁFICO DE VENDAS POR CATEGORIA
// ==============================

const categoryCanvas = document.getElementById("categoryChart");

const categoryChart = new Chart(categoryCanvas, {
    type: "doughnut",

    data: {
        labels: ["Motor", "Freios", "Suspensão", "Elétrica"],

        datasets: [{
            data: [40, 25, 20, 15],

            backgroundColor: [
                "#bf2626",
                "#f59e0b",
                "#10b981",
                "#3b82f6"
            ],

            borderWidth: 0
        }]
    },

    options: {
        responsive: true,
        maintainAspectRatio: false,

        cutout: "65%",

        plugins: {
            legend: {
                position: "right"
            }
        }
    }
});

// ==============================
// FILTRO DE PERÍODO
// ==============================

const periodFilter = document.getElementById("periodFilter");


 // ==============================
 // CARREGAR GRÁFICOS PELA API
 // ==============================

async function carregarGraficos() {

    const periodo = periodFilter.value;

    try {

        const resposta = await fetch(
            `http://127.0.0.1:5000/api/graficos?periodo=${periodo}`
        );

        if (!resposta.ok) {
            throw new Error("Erro ao buscar dados dos gráficos.");
        }

        const dados = await resposta.json();

        // Atualiza gráfico de vendas
        salesChart.data.labels = dados.vendas.labels;

        salesChart.data.datasets[0].data =
            dados.vendas.valores;

        // Atualiza gráfico por categoria
        categoryChart.data.labels = dados.categorias.labels;

        categoryChart.data.datasets[0].data =
            dados.categorias.valores;

        // Atualiza a apresentação dos gráficos
        salesChart.update();
        categoryChart.update();

    } catch (erro) {

        console.error("Erro ao carregar gráficos:", erro);

    }
}

// ==============================
// ATUALIZAÇÃO DO FILTRO
// ==============================

periodFilter.addEventListener("change", function () {

    carregarGraficos();
    carregarIndicadores();

});

// Carrega os gráficos ao abrir o dashboard
carregarGraficos();



// ==============================
// CARREGAR ESTOQUE CRÍTICO PELA API
// ==============================

async function carregarEstoqueCritico() {

    const tabela = document.getElementById("tabelaEstoqueCritico");

    try {

        // Busca os produtos na API Flask
        const resposta = await fetch("http://127.0.0.1:5000/api/produtos");

        if (!resposta.ok) {
            throw new Error("Não foi possível consultar a API.");
        }

        const produtos = await resposta.json();

        // Filtra produtos cuja quantidade está no mínimo ou abaixo dele
        const produtosCriticos = produtos.filter(produto =>
            produto.quantidade <= produto.quantidade_minima
        );

        // Limpa os dados anteriores da tabela
        tabela.innerHTML = "";

        if (produtosCriticos.length === 0) {
            tabela.innerHTML = `
                <tr>
                    <td colspan="5">Nenhum produto com estoque crítico.</td>
                </tr>
            `;
            return;
        }

        // Percorre os produtos encontrados
        produtosCriticos.forEach(produto => {

            const linha = document.createElement("tr");

            const codigo = document.createElement("td");
            codigo.textContent = produto.codigo;
            codigo.classList.add("font-semibold");

            const nome = document.createElement("td");
            nome.textContent = produto.nome;

            const quantidade = document.createElement("td");
            quantidade.textContent = produto.quantidade + " un";
            quantidade.classList.add("text-danger", "font-bold");

            const minimo = document.createElement("td");
            minimo.textContent = produto.quantidade_minima + " un";
            minimo.classList.add("text-muted");

            const acao = document.createElement("td");
            acao.style.textAlign = "right";

            const link = document.createElement("a");
            link.href = "#";
            link.textContent = "Ver";
            link.classList.add("btn-table-action");

            acao.appendChild(link);

            linha.append(codigo, nome, quantidade, minimo, acao);

            tabela.appendChild(linha);
        });

    } catch (erro) {

        console.error("Erro ao carregar estoque:", erro);

        tabela.innerHTML = `
            <tr>
                <td colspan="5">Erro ao carregar os produtos. Verifique se a API está funcionando.</td>
            </tr>
        `;
    }
}

// Executa a consulta quando a página carrega
carregarEstoqueCritico();



// ==============================
// INDICADORES DO DASHBOARD
// ==============================

async function carregarIndicadores() {

    const periodo = periodFilter.value;

    try {

        const resposta = await fetch(
            `http://127.0.0.1:5000/api/indicadores?periodo=${periodo}`
        );

        if (!resposta.ok) {
            throw new Error("Erro ao buscar indicadores.");
        }

        const dados = await resposta.json();

        // Formatação de valores monetários
        const moeda = valor => valor.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

        // Atualização dos quatro cards
        document.getElementById("valorVendas").textContent =
            moeda(dados.vendas_periodo);

        document.getElementById("quantidadeVendas").textContent =
            dados.quantidade_vendas.toLocaleString("pt-BR");

        document.getElementById("totalProdutos").textContent =
            dados.total_produtos.toLocaleString("pt-BR");

        document.getElementById("valorEstoque").textContent =
            moeda(dados.valor_estoque);

    } catch (erro) {

        console.error("Erro ao carregar indicadores:", erro);

    }
}

// Carrega os indicadores ao abrir o dashboard
carregarIndicadores();