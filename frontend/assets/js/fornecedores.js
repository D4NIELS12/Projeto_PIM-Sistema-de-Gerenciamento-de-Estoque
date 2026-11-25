const API_URL = "http://127.0.0.1:5000/api/fornecedores";

const ITENS_POR_PAGINA = 5;
let paginaAtual = 1;

let fornecedores = [];

<<<<<<< HEAD
// Elementos do DOM
const tabelaBody = document.getElementById('tabelaFornecedores');
const buscaGlobal = document.getElementById('buscaGlobalFornecedor');
const filtroTipo = document.getElementById('filtroTipo');
const filtroCidade = document.getElementById('filtroCidade');
const filtroCnpj = document.getElementById('filtroCnpj');
const paginacaoInfo = document.getElementById('paginacaoInfo');
const paginacaoControles = document.getElementById('paginacaoControles');

// Elementos Modal Fornecedor (Adicionar / Editar)
const modalFornecedor = document.getElementById('modalFornecedor');
const formFornecedor = document.getElementById('formFornecedor');
const modalTitulo = document.getElementById('modalTitulo');
const modalSubtitulo = document.getElementById('modalSubtitulo');
const btnSalvarTexto = document.getElementById('btnSalvarTexto');
const inputId = document.getElementById('fornecedorId');
const inputNome = document.getElementById('inputNome');
const inputCnpj = document.getElementById('inputCnpj');
const cnpjHelperText = document.getElementById('cnpjHelperText');
const inputTipo = document.getElementById('inputTipo');
const inputTelefone = document.getElementById('inputTelefone');
const inputEmail = document.getElementById('inputEmail');
const inputCidade = document.getElementById('inputCidade');
const inputUf = document.getElementById('inputUf');

// Elementos Modal Observação
const modalObservacao = document.getElementById('modalObservacao');
const formObservacao = document.getElementById('formObservacao');
const obsFornecedorId = document.getElementById('obsFornecedorId');
const obsFornecedorNome = document.getElementById('obsFornecedorNome');
const inputObservacao = document.getElementById('inputObservacao');

// Carrega os fornecedores do banco de dados
=======
    // Elementos do DOM
    const tabelaBody = document.getElementById('tabelaFornecedores');
    const buscaGlobal = document.getElementById('buscaGlobalFornecedor');
    const filtroTipo = document.getElementById('filtroTipo');
    const filtroCidade = document.getElementById('filtroCidade');
    const filtroCnpj = document.getElementById('filtroCnpj');
    const paginacaoInfo = document.getElementById('paginacaoInfo');
    const paginacaoControles = document.getElementById('paginacaoControles');

    // Elementos Modal Fornecedor (Adicionar / Editar)
    const modalFornecedor = document.getElementById('modalFornecedor');
    const formFornecedor = document.getElementById('formFornecedor');
    const modalTitulo = document.getElementById('modalTitulo');
    const modalSubtitulo = document.getElementById('modalSubtitulo');
    const btnSalvarTexto = document.getElementById('btnSalvarTexto');
    const inputId = document.getElementById('fornecedorId');
    const inputNome = document.getElementById('inputNome');
    const inputCnpj = document.getElementById('inputCnpj');
    const cnpjHelperText = document.getElementById('cnpjHelperText');
    const inputTipo = document.getElementById('inputTipo');
    const inputTelefone = document.getElementById('inputTelefone');
    const inputEmail = document.getElementById('inputEmail');
    const inputCidade = document.getElementById('inputCidade');
    const inputUf = document.getElementById('inputUf');

    // Elementos Modal Observação
    const modalObservacao = document.getElementById('modalObservacao');
    const formObservacao = document.getElementById('formObservacao');
    const obsFornecedorId = document.getElementById('obsFornecedorId');
    const obsFornecedorNome = document.getElementById('obsFornecedorNome');
    const inputObservacao = document.getElementById('inputObservacao');

    // Carrega os fornecedores do banco de dados
>>>>>>> da2339c476046f8e88f086822c63c7947fe7527d
async function carregarFornecedores() {
    try {
        const resposta = await fetch(API_URL);

        if (!resposta.ok) {
            throw new Error("Erro ao carregar fornecedores.");
        }

        fornecedores = await resposta.json();

        renderizarTabela();

    } catch (erro) {
        console.error("Erro:", erro);
        alert("Não foi possível carregar os fornecedores.");
    }
}

<<<<<<< HEAD
// Atualiza opções dinâmicas do filtro de Cidade
function atualizarFiltroCidades() {
    const valorAtual = filtroCidade.value;
    const cidadesUnicas = [...new Set(fornecedores.map(f => `${f.cidade} - ${f.uf}`))].sort();

    filtroCidade.innerHTML = '<option value="">Cidade: Todas</option>';
    cidadesUnicas.forEach(cidadeUf => {
        const option = document.createElement('option');
        option.value = cidadeUf;
        option.textContent = cidadeUf;
        filtroCidade.appendChild(option);
    });

    if (cidadesUnicas.includes(valorAtual)) {
        filtroCidade.value = valorAtual;
    }
}

// Filtra os fornecedores conforme os selects
function obterFornecedoresFiltrados() {
    const tipo = filtroTipo.value;
    const cidade = filtroCidade.value;
    const statusCnpj = filtroCnpj.value;

    return fornecedores.filter(f => {
        const matchTipo = !tipo || f.tipo === tipo;

        const matchCidade = !cidade || `${f.cidade} - ${f.uf}` === cidade;

        const matchCnpj =
            !statusCnpj ||
            (statusCnpj === 'informado' && f.cnpj && f.cnpj.trim() !== '') ||
            (statusCnpj === 'nao-informado' && (!f.cnpj || f.cnpj.trim() === ''));

        return matchTipo && matchCidade && matchCnpj;
    });
}

// Renderiza a tabela e paginação
function renderizarTabela() {
    atualizarFiltroCidades();
    const filtrados = obterFornecedoresFiltrados();
    const totalItens = filtrados.length;
    const totalPaginas = Math.max(1, Math.ceil(totalItens / ITENS_POR_PAGINA));

    if (paginaAtual > totalPaginas) paginaAtual = totalPaginas;

    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    const fim = inicio + ITENS_POR_PAGINA;
    const itensPagina = filtrados.slice(inicio, fim);

    tabelaBody.innerHTML = '';

    if (itensPagina.length === 0) {
        tabelaBody.innerHTML = `
=======
    // Atualiza opções dinâmicas do filtro de Cidade
    function atualizarFiltroCidades() {
        const valorAtual = filtroCidade.value;
        const cidadesUnicas = [...new Set(fornecedores.map(f => `${f.cidade} - ${f.uf}`))].sort();

        filtroCidade.innerHTML = '<option value="">Cidade: Todas</option>';
        cidadesUnicas.forEach(cidadeUf => {
            const option = document.createElement('option');
            option.value = cidadeUf;
            option.textContent = cidadeUf;
            filtroCidade.appendChild(option);
        });

        if (cidadesUnicas.includes(valorAtual)) {
            filtroCidade.value = valorAtual;
        }
    }

    // Filtra os fornecedores conforme busca e selects
    function obterFornecedoresFiltrados() {
        const termo = buscaGlobal.value.trim().toLowerCase();
        const tipo = filtroTipo.value;
        const cidade = filtroCidade.value;
        const statusCnpj = filtroCnpj.value;

        return fornecedores.filter(f => {
            const matchBusca =
                !termo ||
                f.nome.toLowerCase().includes(termo) ||
                f.email.toLowerCase().includes(termo) ||
                f.telefone.toLowerCase().includes(termo) ||
                f.cidade.toLowerCase().includes(termo) ||
                (f.cnpj && f.cnpj.toLowerCase().includes(termo));

            const matchTipo = !tipo || f.tipo === tipo;
            const matchCidade = !cidade || `${f.cidade} - ${f.uf}` === cidade;
            const matchCnpj =
                !statusCnpj ||
                (statusCnpj === 'informado' && f.cnpj && f.cnpj.trim() !== '') ||
                (statusCnpj === 'nao-informado' && (!f.cnpj || f.cnpj.trim() === ''));

            return matchBusca && matchTipo && matchCidade && matchCnpj;
        });
    }

    // Renderiza a tabela e paginação
    function renderizarTabela() {
        atualizarFiltroCidades();
        const filtrados = obterFornecedoresFiltrados();
        const totalItens = filtrados.length;
        const totalPaginas = Math.max(1, Math.ceil(totalItens / ITENS_POR_PAGINA));

        if (paginaAtual > totalPaginas) paginaAtual = totalPaginas;

        const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
        const fim = inicio + ITENS_POR_PAGINA;
        const itensPagina = filtrados.slice(inicio, fim);

        tabelaBody.innerHTML = '';

        if (itensPagina.length === 0) {
            tabelaBody.innerHTML = `
>>>>>>> da2339c476046f8e88f086822c63c7947fe7527d
                <tr>
                    <td colspan="6" style="text-align: center; padding: 36px; color: #6b7280;">
                        Nenhum fornecedor encontrado com os filtros selecionados.
                    </td>
                </tr>
            `;
<<<<<<< HEAD
    } else {
        itensPagina.forEach(f => {
            const temObs = f.observacao && f.observacao.trim() !== '';
            const tr = document.createElement('tr');

            tr.innerHTML = `
=======
        } else {
            itensPagina.forEach(f => {
                const temObs = f.observacao && f.observacao.trim() !== '';
                const tr = document.createElement('tr');

                tr.innerHTML = `
>>>>>>> da2339c476046f8e88f086822c63c7947fe7527d
                    <td>
                        <div class="fornecedor-nome-cell">
                            <span class="fornecedor-nome-titulo">${f.nome}</span>
                            ${f.cnpj ? `<span class="fornecedor-cnpj-sub">CNPJ: ${f.cnpj}</span>` : ''}
                            ${temObs ? `<span class="badge-obs-ativa" title="${f.observacao}">Com observação</span>` : ''}
                        </div>
                    </td>
                    <td>${f.telefone}</td>
                    <td>${f.email}</td>
                    <td>${f.cidade} - ${f.uf}</td>
                    <td>${f.tipo}</td>
                    <td>
                        <div class="acoes-cell">
                            <!-- Botão Adicionar / Ver Observação -->
                            <button type="button" class="btn-acao-icon btn-obs ${temObs ? 'tem-obs' : ''}" 
                                data-id="${f.id}" title="${temObs ? 'Editar observação' : 'Adicionar observação'}">
                                <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
                                    <path d="M3 3.5H15C15.5523 3.5 16 3.94772 16 4.5V12.5C16 13.0523 15.5523 13.5 15 13.5H6L2.5 16V4.5C2.5 3.94772 2.94772 3.5 3.5 3.5Z" 
                                        stroke="#374151" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M6 7.5H12M6 10.5H9.5" stroke="#374151" stroke-width="1.5" stroke-linecap="round"/>
                                </svg>
                            </button>

                            <!-- Botão Editar -->
                            <button type="button" class="btn-acao-icon btn-editar" data-id="${f.id}" title="Editar fornecedor">
                                <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
                                    <path d="M10.5 3.5L14.5 7.5M2.5 15.5H6.5L15 7C15.5523 6.44772 15.5523 5.55228 15 5L13 3C12.4477 2.44772 11.5523 2.44772 11 3L2.5 11.5V15.5Z" 
                                        stroke="#374151" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </button>

                            <!-- Botão Excluir -->
                            <button type="button" class="btn-acao-icon btn-excluir" data-id="${f.id}" title="Excluir fornecedor">
                                <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
                                    <path d="M3 5H15M6.5 5V3.5C6.5 2.94772 6.94772 2.5 7.5 2.5H10.5C11.0523 2.5 11.5 2.94772 11.5 3.5V5M4.5 5L5.2 14.5C5.24 15.05 5.7 15.5 6.25 15.5H11.75C12.3 15.5 12.76 15.05 12.8 14.5L13.5 5" 
                                        stroke="#bf2626" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </button>
                        </div>
                    </td>
                `;
<<<<<<< HEAD
            tabelaBody.appendChild(tr);
        });
    }

    // Atualiza texto informativo e botões de paginação
    const mostrandoDe = totalItens === 0 ? 0 : inicio + 1;
    const mostrandoAte = Math.min(fim, totalItens);
    paginacaoInfo.textContent = `Mostrando ${mostrandoDe} a ${mostrandoAte} de ${totalItens} resultados`;

    renderizarControlesPaginacao(totalPaginas);
}

function renderizarControlesPaginacao(totalPaginas) {
    paginacaoControles.innerHTML = '';

    const btnAnterior = document.createElement('button');
    btnAnterior.className = 'page-btn';
    btnAnterior.textContent = '<';
    btnAnterior.disabled = paginaAtual === 1;
    btnAnterior.onclick = () => {
        if (paginaAtual > 1) {
            paginaAtual--;
            renderizarTabela();
        }
    };
    paginacaoControles.appendChild(btnAnterior);

    for (let i = 1; i <= totalPaginas; i++) {
        const btn = document.createElement('button');
        btn.className = `page-btn ${i === paginaAtual ? 'active' : ''}`;
        btn.textContent = i;
        btn.onclick = () => {
            paginaAtual = i;
            renderizarTabela();
        };
        paginacaoControles.appendChild(btn);
    }

    const btnProximo = document.createElement('button');
    btnProximo.className = 'page-btn';
    btnProximo.textContent = '>';
    btnProximo.disabled = paginaAtual === totalPaginas;
    btnProximo.onclick = () => {
        if (paginaAtual < totalPaginas) {
            paginaAtual++;
            renderizarTabela();
        }
    };
    paginacaoControles.appendChild(btnProximo);
}

// ==========================================
// CONTROLE DOS MODAIS
// ==========================================

function abrirModalAdicionar() {
    formFornecedor.reset();
    inputId.value = '';
    modalTitulo.textContent = 'Adicionar fornecedor';
    modalSubtitulo.textContent = 'Preencha os dados abaixo para registrar um novo fornecedor no sistema.';
    btnSalvarTexto.textContent = 'Salvar fornecedor';
    atualizarHelperCnpj();
    modalFornecedor.classList.remove('hidden');
}

function abrirModalEditar(id) {
    const fornecedor = fornecedores.find(f => f.id === id);
    if (!fornecedor) return;

    inputId.value = fornecedor.id;
    inputNome.value = fornecedor.nome;
    inputCnpj.value = fornecedor.cnpj || '';
    inputTipo.value = fornecedor.tipo;
    inputTelefone.value = fornecedor.telefone;
    inputEmail.value = fornecedor.email;
    inputCidade.value = fornecedor.cidade;
    inputUf.value = fornecedor.uf;

    modalTitulo.textContent = 'Editar fornecedor';
    modalSubtitulo.textContent = 'Atualize as informações cadastrais deste fornecedor.';
    btnSalvarTexto.textContent = 'Salvar alterações';
    atualizarHelperCnpj();
    modalFornecedor.classList.remove('hidden');
}

function abrirModalObservacao(id) {
    const fornecedor = fornecedores.find(f => f.id === id);
    if (!fornecedor) return;

    obsFornecedorId.value = fornecedor.id;
    obsFornecedorNome.textContent = `Fornecedor: ${fornecedor.nome}`;
    inputObservacao.value = fornecedor.observacao || '';
    modalObservacao.classList.remove('hidden');
}
=======
                tabelaBody.appendChild(tr);
            });
        }

        // Atualiza texto informativo e botões de paginação
        const mostrandoDe = totalItens === 0 ? 0 : inicio + 1;
        const mostrandoAte = Math.min(fim, totalItens);
        paginacaoInfo.textContent = `Mostrando ${mostrandoDe} a ${mostrandoAte} de ${totalItens} resultados`;

        renderizarControlesPaginacao(totalPaginas);
    }

    function renderizarControlesPaginacao(totalPaginas) {
        paginacaoControles.innerHTML = '';

        const btnAnterior = document.createElement('button');
        btnAnterior.className = 'page-btn';
        btnAnterior.textContent = '<';
        btnAnterior.disabled = paginaAtual === 1;
        btnAnterior.onclick = () => {
            if (paginaAtual > 1) {
                paginaAtual--;
                renderizarTabela();
            }
        };
        paginacaoControles.appendChild(btnAnterior);

        for (let i = 1; i <= totalPaginas; i++) {
            const btn = document.createElement('button');
            btn.className = `page-btn ${i === paginaAtual ? 'active' : ''}`;
            btn.textContent = i;
            btn.onclick = () => {
                paginaAtual = i;
                renderizarTabela();
            };
            paginacaoControles.appendChild(btn);
        }

        const btnProximo = document.createElement('button');
        btnProximo.className = 'page-btn';
        btnProximo.textContent = '>';
        btnProximo.disabled = paginaAtual === totalPaginas;
        btnProximo.onclick = () => {
            if (paginaAtual < totalPaginas) {
                paginaAtual++;
                renderizarTabela();
            }
        };
        paginacaoControles.appendChild(btnProximo);
    }

    // ==========================================
    // CONTROLE DOS MODAIS
    // ==========================================

    function abrirModalAdicionar() {
        formFornecedor.reset();
        inputId.value = '';
        modalTitulo.textContent = 'Adicionar fornecedor';
        modalSubtitulo.textContent = 'Preencha os dados abaixo para registrar um novo fornecedor no sistema.';
        btnSalvarTexto.textContent = 'Salvar fornecedor';
        atualizarHelperCnpj();
        modalFornecedor.classList.remove('hidden');
    }

    function abrirModalEditar(id) {
        const fornecedor = fornecedores.find(f => f.id === id);
        if (!fornecedor) return;

        inputId.value = fornecedor.id;
        inputNome.value = fornecedor.nome;
        inputCnpj.value = fornecedor.cnpj || '';
        inputTipo.value = fornecedor.tipo;
        inputTelefone.value = fornecedor.telefone;
        inputEmail.value = fornecedor.email;
        inputCidade.value = fornecedor.cidade;
        inputUf.value = fornecedor.uf;

        modalTitulo.textContent = 'Editar fornecedor';
        modalSubtitulo.textContent = 'Atualize as informações cadastrais deste fornecedor.';
        btnSalvarTexto.textContent = 'Salvar alterações';
        atualizarHelperCnpj();
        modalFornecedor.classList.remove('hidden');
    }

    function abrirModalObservacao(id) {
        const fornecedor = fornecedores.find(f => f.id === id);
        if (!fornecedor) return;

        obsFornecedorId.value = fornecedor.id;
        obsFornecedorNome.textContent = `Fornecedor: ${fornecedor.nome}`;
        inputObservacao.value = fornecedor.observacao || '';
        modalObservacao.classList.remove('hidden');
    }
>>>>>>> da2339c476046f8e88f086822c63c7947fe7527d

// Excluir fornecedor
async function excluirFornecedor(id) {
    const fornecedor = fornecedores.find(f => f.id === id);
    if (!fornecedor) return;

    if (!confirm(`Deseja realmente excluir o fornecedor "${fornecedor.nome}"?`)) {
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.erro || 'Erro ao excluir fornecedor.');
        }

        // Atualiza a tabela com os dados do banco
        await carregarFornecedores();

    } catch (erro) {
        console.error('Erro:', erro);
        alert(erro.message || 'Não foi possível excluir o fornecedor.');
    }
}

<<<<<<< HEAD
// Atualiza mensagem auxiliar abaixo do CNPJ (igual à 2ª imagem)
function atualizarHelperCnpj() {
    if (inputCnpj.value.trim() === '') {
        cnpjHelperText.textContent = 'Campo ainda não preenchido.';
        cnpjHelperText.style.color = '#6b7280';
    } else {
        cnpjHelperText.textContent = 'CNPJ informado.';
        cnpjHelperText.style.color = '#16a34a';
    }
}

// Máscaras simples para CNPJ e Telefone
inputCnpj.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '');
    v = v.replace(/^(\d{2})(\d)/, '$1.$2');
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    v = v.replace(/\.(\d{3})(\d)/, '.$1/$2');
    v = v.replace(/(\d{4})(\d)/, '$1-$2');
    e.target.value = v;
    atualizarHelperCnpj();
});

inputTelefone.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '');
    v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
    v = v.replace(/(\d)(\d{4})$/, '$1-$2');
    e.target.value = v;
});
=======
    // Atualiza mensagem auxiliar abaixo do CNPJ (igual à 2ª imagem)
    function atualizarHelperCnpj() {
        if (inputCnpj.value.trim() === '') {
            cnpjHelperText.textContent = 'Campo ainda não preenchido.';
            cnpjHelperText.style.color = '#6b7280';
        } else {
            cnpjHelperText.textContent = 'CNPJ informado.';
            cnpjHelperText.style.color = '#16a34a';
        }
    }

    // Máscaras simples para CNPJ e Telefone
    inputCnpj.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '');
        v = v.replace(/^(\d{2})(\d)/, '$1.$2');
        v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
        v = v.replace(/\.(\d{3})(\d)/, '.$1/$2');
        v = v.replace(/(\d{4})(\d)/, '$1-$2');
        e.target.value = v;
        atualizarHelperCnpj();
    });

    inputTelefone.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '');
        v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
        v = v.replace(/(\d)(\d{4})$/, '$1-$2');
        e.target.value = v;
    });
>>>>>>> da2339c476046f8e88f086822c63c7947fe7527d

// Salvar Fornecedor (Novo ou Edição)
formFornecedor.addEventListener('submit', async (e) => {
    e.preventDefault();

    const idExistente = inputId.value;

    const dadosForm = {
        nome: inputNome.value.trim(),
        cnpj: inputCnpj.value.trim(),
        tipo: inputTipo.value,
        telefone: inputTelefone.value.trim(),
        email: inputEmail.value.trim(),
        cidade: inputCidade.value.trim(),
        uf: inputUf.value
    };

    try {
        // Verifica se é cadastro ou edição
        const url = idExistente
            ? `${API_URL}/${idExistente}`
            : API_URL;

        const metodo = idExistente ? 'PUT' : 'POST';

        const resposta = await fetch(url, {
            method: metodo,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosForm)
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.erro || 'Erro ao salvar fornecedor.');
        }

        // Atualiza a tabela com os dados do banco
        await carregarFornecedores();

        modalFornecedor.classList.add('hidden');

        formFornecedor.reset();

    } catch (erro) {
        console.error('Erro:', erro);
        alert(erro.message || 'Não foi possível salvar o fornecedor.');
    }
});

// Salvar Observação
formObservacao.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = obsFornecedorId.value;
    const textoObs = inputObservacao.value.trim();

    try {
        const resposta = await fetch(`${API_URL}/${id}/observacao`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                observacao: textoObs
            })
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.erro || 'Erro ao salvar observação.');
        }

        // Atualiza os dados da tabela
        await carregarFornecedores();

        // Fecha o modal
        modalObservacao.classList.add('hidden');

    } catch (erro) {
        console.error('Erro:', erro);
        alert(erro.message || 'Não foi possível salvar a observação.');
    }
});

<<<<<<< HEAD
// Eventos de cliques na tabela (Delegação de eventos)
tabelaBody.addEventListener('click', (e) => {
    const btnObs = e.target.closest('.btn-obs');
    const btnEditar = e.target.closest('.btn-editar');
    const btnExcluir = e.target.closest('.btn-excluir');

    if (btnObs) abrirModalObservacao(Number(btnObs.dataset.id));
    if (btnEditar) abrirModalEditar(Number(btnEditar.dataset.id));
    if (btnExcluir) excluirFornecedor(Number(btnExcluir.dataset.id));
});

// Eventos de abertura/fechamento de modais
document.getElementById('btnNovoFornecedor').addEventListener('click', abrirModalAdicionar);
document.getElementById('btnFecharModalFornecedor').addEventListener('click', () => modalFornecedor.classList.add('hidden'));
document.getElementById('btnCancelarFornecedor').addEventListener('click', () => modalFornecedor.classList.add('hidden'));

document.getElementById('btnFecharModalObs').addEventListener('click', () => modalObservacao.classList.add('hidden'));
document.getElementById('btnCancelarObs').addEventListener('click', () => modalObservacao.classList.add('hidden'));

// Fechar modal clicando fora da caixa
[modalFornecedor, modalObservacao].forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    });
});

// Eventos de filtro e busca em tempo real
[buscaGlobal, filtroTipo, filtroCidade, filtroCnpj]
    .filter(el => el !== null)
    .forEach(el => {

=======
    // Eventos de cliques na tabela (Delegação de eventos)
    tabelaBody.addEventListener('click', (e) => {
        const btnObs = e.target.closest('.btn-obs');
        const btnEditar = e.target.closest('.btn-editar');
        const btnExcluir = e.target.closest('.btn-excluir');

        if (btnObs) abrirModalObservacao(Number(btnObs.dataset.id));
        if (btnEditar) abrirModalEditar(Number(btnEditar.dataset.id));
        if (btnExcluir) excluirFornecedor(Number(btnExcluir.dataset.id));
    });

    // Eventos de abertura/fechamento de modais
    document.getElementById('btnNovoFornecedor').addEventListener('click', abrirModalAdicionar);
    document.getElementById('btnFecharModalFornecedor').addEventListener('click', () => modalFornecedor.classList.add('hidden'));
    document.getElementById('btnCancelarFornecedor').addEventListener('click', () => modalFornecedor.classList.add('hidden'));

    document.getElementById('btnFecharModalObs').addEventListener('click', () => modalObservacao.classList.add('hidden'));
    document.getElementById('btnCancelarObs').addEventListener('click', () => modalObservacao.classList.add('hidden'));

    // Fechar modal clicando fora da caixa
    [modalFornecedor, modalObservacao].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.add('hidden');
        });
    });

    // Eventos de filtro e busca em tempo real
    [buscaGlobal, filtroTipo, filtroCidade, filtroCnpj].forEach(el => {
>>>>>>> da2339c476046f8e88f086822c63c7947fe7527d
        el.addEventListener('input', () => {
            paginaAtual = 1;
            renderizarTabela();
        });
<<<<<<< HEAD

=======
>>>>>>> da2339c476046f8e88f086822c63c7947fe7527d
        el.addEventListener('change', () => {
            paginaAtual = 1;
            renderizarTabela();
        });
<<<<<<< HEAD

    });

// Inicialização
carregarFornecedores();
=======
    });

    // Inicialização
    carregarFornecedores();
>>>>>>> da2339c476046f8e88f086822c63c7947fe7527d
