
const API_URL = "http://127.0.0.1:5000/api/produtos";

let produtos = [];

// Carrega os produtos do backend
async function carregarProdutos() {
    const tabela = document.getElementById("tabelaProdutos");

    try {
        const resposta = await fetch(API_URL);

        if (!resposta.ok) {
            throw new Error("Erro ao buscar produtos.");
        }

        produtos = await resposta.json();

        atualizarIndicadores();
        carregarCategorias();
        aplicarFiltros();

    } catch (erro) {
        console.error("Erro:", erro);

        tabela.innerHTML = `
            <tr>
                <td colspan="8">
                    Não foi possível carregar os produtos.
                </td>
            </tr>
        `;
    }
}

// Atualiza os indicadores
function atualizarIndicadores() {
    const total = produtos.length;

    const semEstoque = produtos.filter(
        produto => Number(produto.quantidade) <= 0
    ).length;

    const disponiveis = produtos.filter(
        produto => Number(produto.quantidade) > 0
    ).length;

    const estoqueBaixo = produtos.filter(
        produto =>
            Number(produto.quantidade) > 0 &&
            produto.estoque_baixo === true
    ).length;

    document.getElementById("totalProdutos").textContent = total;
    document.getElementById("produtosDisponiveis").textContent = disponiveis;
    document.getElementById("produtosEstoqueBaixo").textContent = estoqueBaixo;
    document.getElementById("produtosSemEstoque").textContent = semEstoque;
}

// Preenche o filtro de categorias
function carregarCategorias() {
    const filtro = document.getElementById("filtroCategoria");

    const categorias = [
        ...new Set(produtos.map(produto => produto.categoria).filter(Boolean))
    ];

    filtro.innerHTML = '<option value="">Todas as categorias</option>';

    categorias.forEach(categoria => {
        const opcao = document.createElement("option");

        opcao.value = categoria;
        opcao.textContent = categoria;

        filtro.appendChild(opcao);
    });
}

// Determina a situação do produto
function obterStatus(produto) {
    const quantidade = Number(produto.quantidade);

    if (quantidade <= 0) {
        return "zerado";
    }

    if (produto.estoque_baixo === true) {
        return "baixo";
    }

    return "disponivel";
}

// Aplica pesquisa e filtros
function aplicarFiltros() {
    const busca = document
        .getElementById("buscarProduto")
        .value.toLowerCase();

    const categoria = document.getElementById("filtroCategoria").value;
    const status = document.getElementById("filtroEstoque").value;

    const filtrados = produtos.filter(produto => {
        const correspondeBusca =
            produto.nome.toLowerCase().includes(busca) ||
            String(produto.codigo).toLowerCase().includes(busca);

        const correspondeCategoria =
            !categoria || produto.categoria === categoria;

        const correspondeStatus =
            !status || obterStatus(produto) === status;

        return correspondeBusca &&
            correspondeCategoria &&
            correspondeStatus;
    });

    renderizarTabela(filtrados);
}

// Evita inserir conteúdo do banco diretamente como HTML
function escaparHTML(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, caractere => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[caractere]);
}

// Monta a tabela
function renderizarTabela(lista) {
    const tabela = document.getElementById("tabelaProdutos");

    if (lista.length === 0) {
        tabela.innerHTML = `
            <tr>
                <td colspan="8">Nenhum produto encontrado.</td>
            </tr>
        `;
        return;
    }

    tabela.innerHTML = lista.map(produto => {
        const status = obterStatus(produto);

        let textoStatus = "Disponível";

        if (status === "baixo") {
            textoStatus = "Estoque baixo";
        } else if (status === "zerado") {
            textoStatus = "Sem estoque";
        }

        return `
            <tr>
                <td>${escaparHTML(produto.codigo)}</td>
                <td class="font-semibold">${escaparHTML(produto.nome)}</td>
                <td>${escaparHTML(produto.categoria)}</td>
                <td>${escaparHTML(produto.fornecedor || "Não informado")}</td>
                <td>${escaparHTML(produto.quantidade)}</td>
                <td>${escaparHTML(produto.quantidade_minima)}</td>
                <td>${textoStatus}</td>
                <td>Em breve</td>
            </tr>
        `;
    }).join("");
}

// Eventos dos filtros
document.getElementById("buscarProduto")
    .addEventListener("input", aplicarFiltros);

document.getElementById("filtroCategoria")
    .addEventListener("change", aplicarFiltros);

document.getElementById("filtroEstoque")
    .addEventListener("change", aplicarFiltros);

// Inicializa a página
carregarProdutos();


// ==========================================
// CONTROLE DO MODAL DE CADASTRO
// ==========================================

const modalCadastro = document.getElementById("modalCadastro");

const btnCadastrar = document.getElementById("btnCadastrarProduto");
const btnFechar = document.getElementById("btnFecharModal");
const btnCancelar = document.getElementById("btnCancelarCadastro");

// Abre o modal
btnCadastrar.addEventListener("click", () => {
    modalCadastro.classList.add("ativo");
});

// Fecha o modal
function fecharModal() {
    modalCadastro.classList.remove("ativo");
}

btnFechar.addEventListener("click", fecharModal);
btnCancelar.addEventListener("click", fecharModal);

// Fecha ao clicar fora da janela
modalCadastro.addEventListener("click", (evento) => {
    if (evento.target === modalCadastro) {
        fecharModal();
    }
});

// Fecha ao pressionar ESC
document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") {
        fecharModal();
    }
});


// ==========================================
// CARREGAR CATEGORIAS E FORNECEDORES
// ==========================================

async function carregarDadosFormulario() {

    const campoCategoria = document.getElementById("categoria");
    const campoFornecedor = document.getElementById("fornecedor");

    try {

        // Busca as categorias
        const respostaCategorias = await fetch(
            "http://127.0.0.1:5000/api/categorias"
        );

        if (!respostaCategorias.ok) {
            throw new Error("Erro ao carregar categorias.");
        }

        const categorias = await respostaCategorias.json();

        categorias.forEach(categoria => {

            const opcao = document.createElement("option");

            opcao.value = categoria.id;
            opcao.textContent = categoria.nome;

            campoCategoria.appendChild(opcao);

        });


        // Busca os fornecedores
        const respostaFornecedores = await fetch(
            "http://127.0.0.1:5000/api/fornecedores"
        );

        if (!respostaFornecedores.ok) {
            throw new Error("Erro ao carregar fornecedores.");
        }

        const fornecedores = await respostaFornecedores.json();

        fornecedores.forEach(fornecedor => {

            const opcao = document.createElement("option");

            opcao.value = fornecedor.id;
            opcao.textContent = fornecedor.nome;

            campoFornecedor.appendChild(opcao);

        });

    } catch (erro) {

        console.error("Erro ao carregar dados do formulário:", erro);

        alert("Não foi possível carregar categorias e fornecedores.");

    }
}

// Inicializa os dados dos campos
carregarDadosFormulario();


// ==========================================
// CADASTRAR PRODUTO
// ==========================================

const formCadastro = document.getElementById("formCadastroProduto");

formCadastro.addEventListener("submit", async (evento) => {

    evento.preventDefault();

    const botaoSalvar = formCadastro.querySelector(".btn-salvar");

    // Reúne os dados preenchidos no formulário
    const dadosProduto = {
        codigo: document.getElementById("codigo").value.trim(),
        nome: document.getElementById("nome").value.trim(),
        descricao: document.getElementById("descricao").value.trim(),

        id_categoria: Number(document.getElementById("categoria").value),

        id_fornecedor:
            document.getElementById("fornecedor").value || null,

        preco_custo: Number(document.getElementById("precoCusto").value),
        preco_venda: Number(document.getElementById("precoVenda").value),

        quantidade: Number(document.getElementById("quantidade").value),

        quantidade_minima: Number(
            document.getElementById("quantidadeMinima").value
        )
    };

    try {

        botaoSalvar.disabled = true;
        botaoSalvar.textContent = "Cadastrando...";

        // Envia os dados para o Flask
        const resposta = await fetch(
            "http://127.0.0.1:5000/api/produtos",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(dadosProduto)
            }
        );

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                resultado.erro || "Não foi possível cadastrar o produto."
            );
        }

        // Limpa o formulário
        formCadastro.reset();

        // Fecha o modal
        fecharModal();

        // Atualiza a tabela e os indicadores
        await carregarProdutos();

        alert("Produto cadastrado com sucesso!");

    } catch (erro) {

        console.error("Erro ao cadastrar produto:", erro);

        alert(erro.message);

    } finally {

        botaoSalvar.disabled = false;
        botaoSalvar.textContent = "Cadastrar produto";

    }

});