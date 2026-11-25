// ==========================================
// CATEGORIAS - AUTOFLOW
// ==========================================

const API_CATEGORIAS = "http://127.0.0.1:5000/api/categorias";

let categorias = [];

// Elementos da tabela
const tabelaCategorias = document.getElementById("tabelaCategorias");
const buscarCategoria = document.getElementById("buscarCategoria");

// Elementos do modal
const modalCategoria = document.getElementById("modalCategoria");
const btnCadastrarCategoria = document.getElementById("btnCadastrarCategoria");
const btnFecharModalCategoria = document.getElementById("btnFecharModalCategoria");
const btnCancelarCategoria = document.getElementById("btnCancelarCategoria");

// Elementos do formulário
const formCategoria = document.getElementById("formCategoria");
const nomeCategoria = document.getElementById("nomeCategoria");
const descricaoCategoria = document.getElementById("descricaoCategoria");

// Controle de edição
let idCategoriaEditando = null;

// Elementos do modal
const tituloModalCategoria = document.getElementById("tituloModalCategoria");
const btnSalvarCategoria = document.getElementById("btnSalvarCategoria");

// ==========================================
// LISTAR CATEGORIAS
// ==========================================

async function carregarCategorias() {

    try {

        const resposta = await fetch(API_CATEGORIAS);

        categorias = await resposta.json();

        renderizarCategorias();

    } catch (erro) {

        console.error("Erro ao carregar categorias:", erro);

        tabelaCategorias.innerHTML = `
            <tr>
                <td colspan="3">Erro ao carregar categorias.</td>
            </tr>
        `;
    }
}

// ==========================================
// RENDERIZAR TABELA
// ==========================================

function renderizarCategorias(lista = categorias) {

    tabelaCategorias.innerHTML = "";

    lista.forEach(categoria => {

        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>${categoria.nome}</td>
            <td>${categoria.quantidade_produtos}</td>
            <td>
                <button class="btn-editar" onclick="editarCategoria(${categoria.id})">
                    Editar
                </button>

                <button class="btn-excluir" onclick="excluirCategoria(${categoria.id})">
                    Excluir
                </button>
            </td>
        `;

        tabelaCategorias.appendChild(linha);
    });

    if (lista.length === 0) {

        tabelaCategorias.innerHTML = `
            <tr>
                <td colspan="3">Nenhuma categoria encontrada.</td>
            </tr>
        `;
    }
}

// ==========================================
// INICIALIZAÇÃO
// ==========================================

carregarCategorias();

// ==========================================
// BUSCAR CATEGORIAS
// ==========================================

buscarCategoria.addEventListener("input", () => {

    const termo = buscarCategoria.value.toLowerCase().trim();

    const categoriasFiltradas = categorias.filter(categoria =>
        categoria.nome.toLowerCase().includes(termo)
    );

    renderizarCategorias(categoriasFiltradas);
});

// ==========================================
// ABRIR MODAL DE CATEGORIA
// ==========================================
btnCadastrarCategoria.addEventListener("click", () => {

    // Resetar modo de edição
    idCategoriaEditando = null;

    // Limpar campos
    formCategoria.reset();

    // Restaurar título e botão
    tituloModalCategoria.textContent = "Nova categoria";
    btnSalvarCategoria.textContent = "Salvar categoria";

    // Abrir modal
    modalCategoria.classList.add("ativo");
});

// ==========================================
// FECHAR MODAL DE CATEGORIA
// ==========================================

btnFecharModalCategoria.addEventListener("click", () => {
    modalCategoria.classList.remove("ativo");
});

btnCancelarCategoria.addEventListener("click", () => {
    modalCategoria.classList.remove("ativo");
});

// ==========================================
// CADASTRAR CATEGORIA
// ==========================================

formCategoria.addEventListener("submit", async (evento) => {

    evento.preventDefault();

    const dadosCategoria = {
        nome: nomeCategoria.value.trim(),
        descricao: descricaoCategoria.value.trim()
    };

    try {

        const url = idCategoriaEditando !== null
            ? `${API_CATEGORIAS}/${idCategoriaEditando}`
            : API_CATEGORIAS;

        const metodo = idCategoriaEditando !== null
            ? "PUT"
            : "POST";

        const resposta = await fetch(url, {
            method: metodo,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dadosCategoria)
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            alert(resultado.erro);
            return;
        }

        // Mensagem de sucesso
        if (idCategoriaEditando !== null) {
            alert("Categoria atualizada com sucesso!");
        } else {
            alert("Categoria cadastrada com sucesso!");
        }

        // Limpar formulário
        formCategoria.reset();

        // Resetar modo de edição
        idCategoriaEditando = null;

        tituloModalCategoria.textContent = "Nova categoria";
        btnSalvarCategoria.textContent = "Salvar categoria";

        // Fechar modal
        modalCategoria.classList.remove("ativo");

        // Atualizar tabela
        await carregarCategorias();

    } catch (erro) {

        console.error("Erro ao cadastrar categoria:", erro);

        alert("Não foi possível conectar ao servidor.");

    }

});

// ==========================================
// EDITAR CATEGORIA
// ==========================================

function editarCategoria(id) {

    const categoria = categorias.find(item => item.id === id);

    if (!categoria) {
        alert("Categoria não encontrada.");
        return;
    }

    idCategoriaEditando = categoria.id;

    nomeCategoria.value = categoria.nome;
    descricaoCategoria.value = categoria.descricao || "";

    tituloModalCategoria.textContent = "Editar categoria";
    btnSalvarCategoria.textContent = "Salvar alterações";

    modalCategoria.classList.add("ativo");
}

// ==========================================
// EXCLUIR CATEGORIA
// ==========================================

async function excluirCategoria(id) {

    const categoria = categorias.find(item => item.id === id);

    if (!categoria) {
        alert("Categoria não encontrada.");
        return;
    }

    const confirmar = confirm(
        `Deseja realmente excluir a categoria "${categoria.nome}"?`
    );

    if (!confirmar) {
        return;
    }

    try {

        const resposta = await fetch(`${API_CATEGORIAS}/${id}`, {
            method: "DELETE"
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            alert(resultado.erro);
            return;
        }

        alert("Categoria excluída com sucesso!");

        await carregarCategorias();

    } catch (erro) {

        console.error("Erro ao excluir categoria:", erro);

        alert("Não foi possível conectar ao servidor.");

    }

}