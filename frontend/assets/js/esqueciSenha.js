
const formEsqueciSenha = document.getElementById("formEsqueciSenha");
const campoEmail = document.getElementById("email");

formEsqueciSenha.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = campoEmail.value.trim().toLowerCase();

    try {
        const resposta = await fetch("http://127.0.0.1:5000/api/verificar-email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            alert(dados.erro || "Não foi possível verificar o e-mail.");
            return;
        }

        alert(dados.mensagem);

        // Guarda o e-mail para a próxima etapa
        sessionStorage.setItem("emailRecuperacao", dados.usuario.email);

        // Vai para a tela de redefinição de senha
        window.location.href = "redefinirSenha.html";

    } catch (erro) {
        console.error("Erro ao verificar e-mail:", erro);
        alert("Não foi possível conectar ao servidor.");
    }
});