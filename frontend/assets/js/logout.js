
const btnLogout = document.getElementById("btnLogout");

if (btnLogout) {
    btnLogout.addEventListener("click", async function (event) {
        event.preventDefault();

        try {
            const resposta = await fetch("http://127.0.0.1:5000/api/logout", {
                method: "POST",
                credentials: "include"
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                alert(dados.erro || "Erro ao sair da conta.");
                return;
            }

            window.location.href = "telaLogin.html";

        } catch (erro) {
            console.error("Erro ao realizar logout:", erro);
            alert("Não foi possível conectar ao servidor.");
        }
    });
}