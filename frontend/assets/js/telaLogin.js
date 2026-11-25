// ==========================================
// AUTOFLOW - LOGIN
// ==========================================

const formLogin = document.getElementById("formLogin");
const campoEmail = document.getElementById("email");
const campoSenha = document.getElementById("password");

// ==========================================
// EVENTO DE ENVIO DO FORMULÁRIO
// ==========================================
formLogin.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = campoEmail.value.trim();
    const senha = campoSenha.value;

    try {
        const resposta = await fetch("http://127.0.0.1:5000/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
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

        window.location.href = "dashboard.html";

    } catch (erro) {
        console.error("Erro ao conectar com o servidor:", erro);
        alert("Não foi possível conectar ao servidor.");
    }
});
