
const API_URL = "http://127.0.0.1:5000/api";

// Lista de produtos recebidos do banco
let produtos = [];
// Lista de produtos adicionados ao carrinho
let carrinho = [];

// Elementos da página
const listaProdutos = document.getElementById("listaProdutosVenda");

// Carrega os produtos do banco
async function carregarProdutos() {

    try {

        const resposta = await fetch(`${API_URL}/produtos`);

        if (!resposta.ok) {
            throw new Error("Erro ao carregar os produtos.");
        }

        produtos = await resposta.json();

        exibirProdutos(produtos);

    } catch (erro) {

        console.error(erro);

        listaProdutos.textContent = "Não foi possível carregar os produtos.";

    }
}

// Exibe os produtos na tela
function exibirProdutos(lista) {

    listaProdutos.innerHTML = "";

    lista.forEach(produto => {

        const card = document.createElement("div");
        card.className = "produto-venda-card";

        const nome = document.createElement("h4");
        nome.textContent = produto.nome;

        const codigo = document.createElement("p");
        codigo.textContent = `Código: ${produto.codigo}`;

        const preco = document.createElement("strong");
        preco.textContent = Number(produto.preco).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

        const estoque = document.createElement("p");
        estoque.textContent = `Disponível: ${produto.quantidade} unidades`;

        // Botão para adicionar ao carrinho
        const botaoAdicionar = document.createElement("button");

        botaoAdicionar.textContent = "Adicionar";
        botaoAdicionar.className = "btn-adicionar-produto";

        botaoAdicionar.addEventListener("click", () => {
            adicionarAoCarrinho(produto);
        });

        card.append(nome, codigo, preco, estoque, botaoAdicionar);

        listaProdutos.appendChild(card);
    });

}

// Pesquisa produtos pelo nome ou código
const campoBusca = document.getElementById("buscarProdutoVenda");

campoBusca.addEventListener("input", () => {

    const pesquisa = campoBusca.value.toLowerCase().trim();

    const produtosFiltrados = produtos.filter(produto => {

        return produto.nome.toLowerCase().includes(pesquisa) ||
            produto.codigo.toLowerCase().includes(pesquisa);

    });

    exibirProdutos(produtosFiltrados);

});

// Adiciona produto ao carrinho
function adicionarAoCarrinho(produto) {

    const item = carrinho.find(item => item.id === produto.id);

    // Verifica se o produto já está no carrinho
    const quantidadeAtual = item ? item.quantidade : 0;

    // Verifica se existe estoque disponível
    if (quantidadeAtual >= produto.quantidade) {
        alert("Quantidade máxima disponível em estoque.");
        return;
    }

    if (item) {

        item.quantidade++;

    } else {

        carrinho.push({
            id: produto.id,
            nome: produto.nome,
            preco: Number(produto.preco),
            estoque: produto.quantidade,
            quantidade: 1
        });

    }

    atualizarCarrinho();
}

// Atualiza o resumo da venda
function atualizarCarrinho() {

    const itensCarrinho = document.getElementById("itensCarrinho");
    const valorTotal = document.getElementById("valorTotal");

    itensCarrinho.innerHTML = "";

    let total = 0;

    if (carrinho.length === 0) {

        itensCarrinho.innerHTML = `
            <p class="carrinho-vazio">
                Nenhum produto adicionado.
            </p>
        `;

    }

    carrinho.forEach(item => {

        const subtotal = item.preco * item.quantidade;

        total += subtotal;

        const produtoCarrinho = document.createElement("div");

        produtoCarrinho.className = "item-carrinho";

        produtoCarrinho.innerHTML = `
            <strong>${item.nome}</strong>

            <p>Quantidade: ${item.quantidade}</p>

            <p>Subtotal: ${subtotal.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
            })}</p>

            <button data-id="${item.id}" data-acao="diminuir">-</button>
            <button data-id="${item.id}" data-acao="aumentar">+</button>
            <button data-id="${item.id}" data-acao="remover">Remover</button>
        `;

        itensCarrinho.appendChild(produtoCarrinho);

    });

    valorTotal.textContent = total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

}

// Controla os botões do carrinho
document.getElementById("itensCarrinho").addEventListener("click", evento => {

    const botao = evento.target;

    if (botao.tagName !== "BUTTON") return;

    const id = Number(botao.dataset.id);
    const acao = botao.dataset.acao;

    const item = carrinho.find(item => item.id === id);

    if (!item) return;

    if (acao === "aumentar") {

        if (item.quantidade >= item.estoque) {
            alert("Quantidade máxima disponível em estoque.");
            return;
        }

        item.quantidade++;

    }

    if (acao === "diminuir") {

        item.quantidade--;

        if (item.quantidade <= 0) {
            carrinho = carrinho.filter(item => item.id !== id);
        }

    }

    if (acao === "remover") {

        carrinho = carrinho.filter(item => item.id !== id);

    }

    atualizarCarrinho();

});

// Finaliza a venda
document.getElementById("btnFinalizarVenda").addEventListener("click", async () => {

    // Verifica se existem produtos no carrinho
    if (carrinho.length === 0) {
        alert("Adicione pelo menos um produto à venda.");
        return;
    }

    const botao = document.getElementById("btnFinalizarVenda");

    // Prepara os dados para enviar ao backend
    const dadosVenda = {
        itens: carrinho.map(item => ({
            id_produto: item.id,
            quantidade: item.quantidade
        }))
    };

    try {

        botao.disabled = true;
        botao.textContent = "Registrando venda...";

        const resposta = await fetch(`${API_URL}/vendas`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dadosVenda)
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.erro || "Não foi possível registrar a venda.");
        }

        // Limpa o carrinho após o sucesso
        carrinho = [];

        atualizarCarrinho();

        // Atualiza os produtos e as quantidades disponíveis
        await carregarProdutos();

        alert(
            `${resultado.mensagem}\n` +
            `Venda: ${resultado.id_venda}\n` +
            `Total: ${Number(resultado.valor_total).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
            })}`
        );

    } catch (erro) {

        alert(erro.message);

    } finally {

        botao.disabled = false;
        botao.textContent = "Finalizar venda";

    }

});

// Inicia o carregamento
carregarProdutos();
