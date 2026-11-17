
const API_URL = "http://127.0.0.1:5000/api/produtos";

let produtos = [];
let idProdutoEditando = null;

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
                <td>
                    <button
                        class="btn-editar"
                        data-id="${produto.id}"
                        type="button"
                    >
                        Editar
                    </button>

                    <button
                        class="btn-excluir"
                        data-id="${produto.id}"
                        type="button"
                    >
                        Excluir
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

// ==========================================
// EXCLUIR PRODUTO
// ==========================================

async function excluirProduto(id) {

    const confirmar = confirm(
        "Tem certeza que deseja excluir este produto?"
    );

    if (!confirmar) {
        return;
    }

    try {

        const resposta = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                resultado.erro || "Não foi possível excluir o produto."
            );
        }

        alert("Produto excluído com sucesso!");

        // Atualiza a tabela e os indicadores
        await carregarProdutos();

    } catch (erro) {

        console.error("Erro ao excluir produto:", erro);

        alert(erro.message);
    }
}

// Detecta cliques nos botões da tabela

document.getElementById("tabelaProdutos")
    .addEventListener("click", (evento) => {

        const botaoExcluir = evento.target.closest(".btn-excluir");
        const botaoEditar = evento.target.closest(".btn-editar");

        if (botaoExcluir) {
            const id = Number(botaoExcluir.dataset.id);
            excluirProduto(id);
        }

        if (botaoEditar) {
            const id = Number(botaoEditar.dataset.id);
            editarProduto(id);
        }
    });

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

const formCadastro = document.getElementById("formCadastroProduto");

const btnCadastrar = document.getElementById("btnCadastrarProduto");
const btnFechar = document.getElementById("btnFecharModal");
const btnCancelar = document.getElementById("btnCancelarCadastro");

// Abre o modal
btnCadastrar.addEventListener("click", () => {
    modalCadastro.classList.add("ativo");
});

function fecharModal() {

    modalCadastro.classList.remove("ativo");

    // Limpa os dados do formulário
    formCadastro.reset();

    // Volta para o modo de cadastro
    idProdutoEditando = null;

    // Reativa e exibe o campo de quantidade
    const campoQuantidade = document.getElementById("quantidade");

    campoQuantidade.disabled = false;
    campoQuantidade.closest(".form-group").style.display = "";

    // Restaura o título e o botão
    document.querySelector(".modal-header h2").textContent =
        "Cadastrar produto";

    document.querySelector(".btn-salvar").textContent =
        "Cadastrar produto";
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
const dadosFormularioCarregados = carregarDadosFormulario();


// ==========================================
// CADASTRAR PRODUTO
// ==========================================

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

        quantidade_minima: Number(
            document.getElementById("quantidadeMinima").value
        )
    };

    // Só envia a quantidade atual durante o cadastro
    if (idProdutoEditando === null) {
        dadosProduto.quantidade = Number(
            document.getElementById("quantidade").value
        );
    }

    try {

        botaoSalvar.disabled = true;

        const editando = idProdutoEditando !== null;

        botaoSalvar.textContent = editando
            ? "Salvando..."
            : "Cadastrando...";

        // Define a rota e o método conforme a operação
        const url = editando
            ? `${API_URL}/${idProdutoEditando}`
            : API_URL;

        const metodo = editando ? "PUT" : "POST";

        const resposta = await fetch(url, {
            method: metodo,

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(dadosProduto)
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                resultado.erro || "Não foi possível salvar o produto."
            );
        }

        // Fecha e limpa o modal
        fecharModal();

        // Atualiza tabela e indicadores
        await carregarProdutos();

        alert(
            editando
                ? "Produto atualizado com sucesso!"
                : "Produto cadastrado com sucesso!"
        );

    } catch (erro) {

        console.error("Erro ao salvar produto:", erro);

        alert(erro.message);

    } finally {

        botaoSalvar.disabled = false;

        botaoSalvar.textContent = idProdutoEditando !== null
            ? "Salvar alterações"
            : "Cadastrar produto";
    }

});


// ==========================================
// ABRIR EDIÇÃO DO PRODUTO
// ==========================================

async function editarProduto(id) {

    await dadosFormularioCarregados;

    const produto = produtos.find(
        produto => Number(produto.id) === id
    );

    if (!produto) {
        alert("Produto não encontrado.");
        return;
    }

    idProdutoEditando = id;

    // Preenche os campos do formulário
    document.getElementById("codigo").value = produto.codigo;
    document.getElementById("nome").value = produto.nome;
    document.getElementById("descricao").value = produto.descricao || "";

    document.getElementById("categoria").value = produto.id_categoria;

    document.getElementById("fornecedor").value =
        produto.id_fornecedor || "";

    document.getElementById("precoCusto").value = produto.preco_custo;
    document.getElementById("precoVenda").value = produto.preco;

    document.getElementById("quantidadeMinima").value =
        produto.quantidade_minima;

    // Quantidade atual não será editada diretamente
    const campoQuantidade = document.getElementById("quantidade");

    campoQuantidade.value = produto.quantidade;
    campoQuantidade.disabled = true;

    campoQuantidade.closest(".form-group").style.display = "none";

    // Altera o título e o botão do modal
    document.querySelector(".modal-header h2").textContent =
        "Editar produto";

    document.querySelector(".btn-salvar").textContent =
        "Salvar alterações";

    modalCadastro.classList.add("ativo");
}