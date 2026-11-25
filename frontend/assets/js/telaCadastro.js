const formCadastro = document.getElementById("formCadastro");

const campoNome = document.getElementById("nome");
const campoEmail = document.getElementById("email");
const campoSenha = document.getElementById("password");
const campoConfirmarSenha = document.getElementById("confirmPassword");

formCadastro.addEventListener("submit", async function (event) {
    event.preventDefault();

    const nome = campoNome.value.trim();
    const email = campoEmail.value.trim();
    const senha = campoSenha.value;
    const confirmarSenha = campoConfirmarSenha.value;

    // Verifica se as senhas são iguais
    if (senha !== confirmarSenha) {
        alert("As senhas não coincidem.");
        campoConfirmarSenha.focus();
        return;
    }

    // Verifica o tamanho da senha
    if (senha.length < 6) {
        alert("A senha deve ter pelo menos 6 caracteres.");
        campoSenha.focus();
        return;
    }

    try {
        const resposta = await fetch("http://127.0.0.1:5000/api/cadastro", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nome: nome,
                email: email,
                senha: senha
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            alert(dados.erro);
            return;
        }

        alert(dados.mensagem);

        window.location.href = "telaLogin.html";

    } catch (erro) {
        console.error("Erro ao cadastrar:", erro);
        alert("Não foi possível conectar ao servidor.");
    }
});
