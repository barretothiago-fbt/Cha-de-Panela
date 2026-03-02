// 1. CONFIGURAÇÃO DO FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyD_FpFx6UOYK2t7NUq_97u_HKW3_VT4S3E",
  authDomain: "chadepanela-575b6.firebaseapp.com",
  databaseURL: "https://chadepanela-575b6-default-rtdb.firebaseio.com",
  projectId: "chadepanela-575b6",
  storageBucket: "chadepanela-575b6.firebasestorage.app",
  messagingSenderId: "843699734776",
  appId: "1:843699734776:web:22b9cb8836ee5f95c8d30d"
};

// Inicializa o Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

// --- LÓGICA DE PRESENÇA (index.html / presenca.html) ---
const formPresenca = document.getElementById('form-presenca');
if (formPresenca) {
    formPresenca.onsubmit = (e) => {
        e.preventDefault();
        const nome = document.getElementById('nome').value;
        const qtd = document.getElementById('qtd').value;
        
        db.ref('confirmacoes').push({ 
            nome: nome, 
            quantidade: qtd, 
            data: new Date().toLocaleString() 
        }).then(() => {
            formPresenca.style.display = 'none';
            document.getElementById('feedback').style.display = 'block';
        });
    };
}

// --- LÓGICA DE PRESENTES (presentes.html) ---
const listaContainer = document.getElementById('lista-presentes');
if (listaContainer) {
    db.ref('presentes').on('value', (snapshot) => {
        listaContainer.innerHTML = "";
        const dados = snapshot.val();
        
        if(!dados) {
            listaContainer.innerHTML = "<p>Carregando lista de presentes...</p>";
            return;
        }

        Object.keys(dados).forEach(id => {
            const item = dados[id];
            const div = document.createElement('div');
            div.className = `item-presente ${!item.disponivel ? 'comprado' : ''}`;
            
            const fotoUrl = item.foto || 'https://via.placeholder.com/200?text=Presente';

            div.innerHTML = `
                <img src="${fotoUrl}" alt="${item.nome}">
                <h3>${item.nome}</h3>
                <p class="status">${item.disponivel ? '✅ Disponível' : '🎁 Reservado'}</p>
                
                ${item.disponivel ? `
                    <button onclick="comprarEReservar('${id}', '${item.nome}', '${item.linkLoja}')">
                        Escolher e Comprar
                    </button>
                ` : `
                    <button disabled style="background:#ccc; cursor:not-allowed;">Já Reservado</button>
                    <p style="font-size: 0.75rem; margin-top: 8px; color: #777;">
                        Reservou sem querer? <br>
                        <a href="javascript:void(0)" onclick="liberarItem('${id}', '${item.nome}')" style="color: #d4a373; text-decoration: underline;">Clique aqui para liberar</a>
                    </p>
                `}
            `;
            listaContainer.appendChild(div);
        });
    });
}

// --- FUNÇÃO PARA RESERVAR E ABRIR A LOJA ---
window.comprarEReservar = (id, nome, linkLoja) => {
    const quem = prompt(`Você escolheu: ${nome}\nPara confirmarmos sua reserva, qual o seu nome?`);
    
    if(quem && quem.trim() !== "") {
        db.ref('presentes/' + id).update({
            disponivel: false,
            quem: quem,
            dataReserva: new Date().toLocaleString()
        }).then(() => {
            alert("Reserva confirmada no site! Vamos te levar para a loja agora.");
            if(linkLoja && linkLoja !== "" && linkLoja !== "undefined") {
                window.open(linkLoja, '_blank');
            }
        });
    } else if (quem !== null) {
        alert("O nome é obrigatório para reservar.");
    }
};

// --- FUNÇÃO PARA LIBERAR ITEM DESISTIDO ---
window.liberarItem = (id, nome) => {
    const confirmar = confirm(`Deseja liberar o item "${nome}" para que outra pessoa possa escolher?`);
    if(confirmar) {
        db.ref('presentes/' + id).update({
            disponivel: true,
            quem: "",
            dataReserva: null
        }).then(() => {
            alert("O item está disponível novamente!");
        });
    }
};

// --- FUNÇÃO PARA INJETAR ITENS (USE NO CONSOLE F12) ---
window.injetarItens = () => {
    const lista = ["Jogo de Panelas", "Conjunto de Utensílios", "Potes de Vidro", "Batedeira", "Liquidificador", "Jogo de Pratos", "Faqueiro", "Tábua de Corte", "Escorredor de Louças", "Assadeiras Marinex", "Porta Temperos", "Mixer", "Sanduicheira", "Espremedor de Frutas", "Taças de Água", "Toalhas de Banho", "Descanso de Panela", "Panos de Prato", "Organizador de Gavetas", "Fruteira", "Jarra de Vidro", "Moedor de Pimenta", "Xícaras de Chá", "Boleira", "Balança de Cozinha", "Chaleira Elétrica", "Cantinho do Café", "Prensa Francesa", "Suporte de Cápsulas", "Copos Altos", "Petisqueira", "Abridor de Vinho", "Cortador de Legumes", "Aparelho de Jantar", "Garrafa Térmica", "Luva Térmica", "Cesto de Roupas", "Kit Banheiro", "Tapete de Cozinha", "Manteigueira", "Açucareiro", "Saladeira Grande", "Rolo de Massa"];
    
    lista.forEach((n, i) => {
        db.ref('presentes/item_' + (i + 1)).set({
            nome: n,
            disponivel: true,
            quem: "",
            foto: "",
            linkLoja: ""
        });
    });
    console.log("Banco de dados pronto para receber fotos e links!");
};