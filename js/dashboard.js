// ==============================
// GRÁFICO DE VENDAS POR MÊS
// ==============================

const salesCanvas = document.getElementById("salesChart");

const salesChart = new Chart(salesCanvas, {
    type: "bar",

    data: {
        labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],

        datasets: [{
            label: "Vendas",
            data: [12000, 18000, 28000, 22000, 32000, 36000],
            backgroundColor: "#bf2626",
            borderRadius: 5,
            maxBarThickness: 36
        }]
    },

    options: {
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
            legend: {
                display: false
            },

            tooltip: {
                callbacks: {
                    label: function (context) {
                        return context.dataset.label + ": " +
                            context.parsed.y.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL"
                            });
                    }
                }
            }
        },

        scales: {
            y: {
                beginAtZero: true,

                ticks: {
                    callback: function (value) {
                        return "R$ " + value.toLocaleString("pt-BR");
                    }
                }
            }
        }
    }
});


// ==============================
// GRÁFICO DE VENDAS POR CATEGORIA
// ==============================

const categoryCanvas = document.getElementById("categoryChart");

const categoryChart = new Chart(categoryCanvas, {
    type: "doughnut",

    data: {
        labels: ["Motor", "Freios", "Suspensão", "Elétrica"],

        datasets: [{
            data: [40, 25, 20, 15],

            backgroundColor: [
                "#bf2626",
                "#f59e0b",
                "#10b981",
                "#3b82f6"
            ],

            borderWidth: 0
        }]
    },

    options: {
        responsive: true,
        maintainAspectRatio: false,

        cutout: "65%",

        plugins: {
            legend: {
                position: "right"
            }
        }
    }
});