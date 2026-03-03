// CONFIGURAÇÃO DO FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyD_FpFx6UOYK2t7NUq_97u_HKW3_VT4S3E",
  authDomain: "chadepanela-575b6.firebaseapp.com",
  databaseURL: "https://chadepanela-575b6-default-rtdb.firebaseio.com",
  projectId: "chadepanela-575b6",
  storageBucket: "chadepanela-575b6.firebasestorage.app",
  messagingSenderId: "843699734776",
  appId: "1:843699734776:web:22b9cb8836ee5f95c8d30d"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

// --- LÓGICA DE PRESENÇA ---
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

// --- LÓGICA DE PRESENTES ---
const listaContainer = document.getElementById('lista-presentes');
if (listaContainer) {
    db.ref('presentes').on('value', (snapshot) => {
        listaContainer.innerHTML = "";
        const dados = snapshot.val();
        if(!dados) return;

        Object.keys(dados).forEach(id => {
            const item = dados[id];
            const div = document.createElement('div');
            div.className = `item-presente ${!item.disponivel ? 'comprado' : ''}`;
            const fotoUrl = item.foto || 'https://via.placeholder.com/200?text=Sem+Foto';

            div.innerHTML = `
                <img src="${fotoUrl}" alt="${item.nome}">
                <h3>${item.nome}</h3>
                
                <div id="acoes-${id}">
                    ${item.disponivel ? `
                        <p class="status">✅ Disponível</p>
                        <button class="btn-ver" onclick="prepararReserva('${id}', '${item.linkLoja}')">
                            Ver Produto e Escolher
                        </button>
                    ` : `
                        <p class="status reservado">🎁 Já Reservado</p>
                        <button disabled class="btn-reservado">Reservado</button>
                        <p class="liberar-txt">
                            Reservou errado? <br>
                            <a href="javascript:void(0)" onclick="liberarItem('${id}', '${item.nome}')">Clique aqui para liberar</a>
                        </p>
                    `}
                </div>
            `;
            listaContainer.appendChild(div);
        });
    });
}

// 1. Abre a loja e mostra o campo de nome no próprio card
window.prepararReserva = (id, linkLoja) => {
    // Abre a loja
    if (linkLoja && linkLoja !== "" && linkLoja !== "undefined") {
        window.open(linkLoja, '_blank');
    }

    // Transforma o botão em campo de texto
    const container = document.getElementById(`acoes-${id}`);
    container.innerHTML = `
        <input type="text" id="input-${id}" placeholder="Seu nome" class="input-reserva">
        <button class="btn-confirmar" onclick="confirmarReserva('${id}')">Confirmar Reserva</button>
        <button class="btn-cancelar" onclick="location.reload()">Cancelar</button>
    `;
};

// 2. Salva a reserva definitiva
window.confirmarReserva = (id) => {
    const nomeConvidado = document.getElementById(`input-${id}`).value;
    
    if (nomeConvidado && nomeConvidado.trim() !== "") {
        db.ref('presentes/' + id).update({
            disponivel: false,
            quem: nomeConvidado,
            dataReserva: new Date().toLocaleString()
        }).then(() => {
            alert("Reserva confirmada! Muito obrigado.");
        });
    } else {
        alert("Por favor, digite seu nome para reservar.");
    }
};

// FUNÇÃO PARA LIBERAR ITEM
window.liberarItem = (id, nome) => {
    if (confirm(`Deseja tornar o item "${nome}" disponível novamente?`)) {
        db.ref('presentes/' + id).update({
            disponivel: true, quem: "", dataReserva: null
        });
    }
};

// FUNÇÃO PARA INJETAR ITENS (CONSOLE F12)
window.injetarItens = () => {
    const lista = ["Jogo de Panelas", "Conjunto de Utensílios", "Potes de Vidro", "Batedeira", "Liquidificador", "Jogo de Pratos", "Faqueiro", "Tábua de Corte", "Escorredor de Louças", "Assadeiras Marinex", "Porta Temperos", "Mixer", "Sanduicheira", "Espremedor de Frutas", "Taças de Água", "Toalhas de Banho", "Descanso de Panela", "Panos de Prato", "Organizador de Gavetas", "Fruteira", "Jarra de Vidro", "Moedor de Pimenta", "Xícaras de Chá", "Boleira", "Balança de Cozinha", "Chaleira Elétrica", "Cantinho do Café", "Prensa Francesa", "Suporte de Cápsulas", "Copos Altos", "Petisqueira", "Abridor de Vinho", "Cortador de Legumes", "Aparelho de Jantar", "Garrafa Térmica", "Luva Térmica", "Cesto de Roupas", "Kit Banheiro", "Tapete de Cozinha", "Manteigueira", "Açucareiro", "Saladeira Grande", "Rolo de Massa"];
    lista.forEach((n, i) => {
        db.ref('presentes/item_' + (i + 1)).set({
            nome: n, disponivel: true, quem: "", foto: "", linkLoja: ""
        });
    });
};

// CONFIGURAÇÃO DA SENHA
const SENHA_CORRETA = "060625"; 

window.verificarSenha = () => {
    const senhaDigitada = document.getElementById('senha-input').value;
    const telaLogin = document.getElementById('login-screen');
    const conteudoSite = document.getElementById('conteudo-site');
    const erro = document.getElementById('erro-senha');

    if (senhaDigitada === SENHA_CORRETA) {
        if(telaLogin) telaLogin.style.display = 'none';
        if(conteudoSite) conteudoSite.style.display = 'block';
        // Salva o acesso no navegador do convidado
        localStorage.setItem('acessoPermitido', 'true');
    } else {
        if(erro) erro.style.display = 'block';
    }
};

// Verificação automática ao carregar a página
window.addEventListener('load', () => {
    if (localStorage.getItem('acessoPermitido') === 'true') {
        const telaLogin = document.getElementById('login-screen');
        const conteudoSite = document.getElementById('conteudo-site');
        if (telaLogin) telaLogin.style.display = 'none';
        if (conteudoSite) conteudoSite.style.display = 'block';
    }
});