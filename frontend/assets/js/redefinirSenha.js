
const formRedefinirSenha = document.getElementById("formRedefinirSenha");

const campoNovaSenha = document.getElementById("novaSenha");
const campoConfirmarSenha = document.getElementById("confirmarSenha");

formRedefinirSenha.addEventListener("submit", async function (event) {
    event.preventDefault();

    const novaSenha = campoNovaSenha.value;
    const confirmarSenha = campoConfirmarSenha.value;

    // Verifica se as senhas coincidem
    if (novaSenha !== confirmarSenha) {
        alert("As senhas não coincidem.");
        campoConfirmarSenha.focus();
        return;
    }

    // Verifica o tamanho da senha
    if (novaSenha.length < 6) {
        alert("A senha deve ter pelo menos 6 caracteres.");
        campoNovaSenha.focus();
        return;
    }

    // Recupera o e-mail verificado anteriormente
    const email = sessionStorage.getItem("emailRecuperacao");

    if (!email) {
        alert("E-mail não encontrado. Faça a verificação novamente.");
        window.location.href = "telaEsqueciSenha.html";
        return;
    }

    try {
        const resposta = await fetch("http://127.0.0.1:5000/api/redefinir-senha", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                nova_senha: novaSenha
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            alert(dados.erro || "Erro ao redefinir senha.");
            return;
        }

        alert(dados.mensagem);

        // Remove o e-mail armazenado
        sessionStorage.removeItem("emailRecuperacao");

        // Volta para o login
        window.location.href = "telaLogin.html";

    } catch (erro) {
        console.error("Erro ao redefinir senha:", erro);
        alert("Não foi possível conectar ao servidor.");
    }
});