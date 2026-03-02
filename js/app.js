// 1. IMPORTAÇÕES DAS FUNÇÕES DO FIREBASE (Via CDN para rodar no navegador)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, set, onValue, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// 2. SUAS CREDENCIAIS DO FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyD_FpFx6UOYK2t7NUq_97u_HKW3_VT4S3E",
  authDomain: "chadepanela-575b6.firebaseapp.com",
  databaseURL: "https://chadepanela-575b6-default-rtdb.firebaseio.com",
  projectId: "chadepanela-575b6",
  storageBucket: "chadepanela-575b6.firebasestorage.app",
  messagingSenderId: "843699734776",
  appId: "1:843699734776:web:22b9cb8836ee5f95c8d30d",
  measurementId: "G-1G4L5T4RRX"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Expõe funções para o console (necessário para injetar os itens da lista)
window.db = db;
window.dbRef = ref;
window.dbSet = set;

/* -----------------------------------------------------------
   3. LÓGICA DE PRESENÇA (Funciona na index ou presenca.html)
----------------------------------------------------------- */
const formPresenca = document.getElementById('form-presenca');
if (formPresenca) {
    formPresenca.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const btn = document.getElementById('btn-confirmar');
        const feedback = document.getElementById('feedback');
        const nome = document.getElementById('nome').value;
        const qtd = document.getElementById('qtd').value;

        // Desativa o botão para evitar cliques duplos
        btn.disabled = true;
        btn.innerText = "Enviando...";

        const dados = {
            nome: nome,
            quantidade: qtd,
            dataRegistro: new Date().toLocaleString()
        };

        // Salva no nó "confirmacoes"
        push(ref(db, 'confirmacoes'), dados)
            .then(() => {
                formPresenca.style.display = 'none';
                feedback.style.display = 'block';
            })
            .catch(err => {
                alert("Erro ao salvar: " + err.message);
                btn.disabled = false;
                btn.innerText = "Confirmar Presença";
            });
    });
}

/* -----------------------------------------------------------
   4. LÓGICA DE PRESENTES (Funciona na presentes.html)
----------------------------------------------------------- */
const listaContainer = document.getElementById('lista-presentes');
if (listaContainer) {
    // Escuta mudanças no nó "presentes" em tempo real
    onValue(ref(db, 'presentes'), (snapshot) => {
        listaContainer.innerHTML = "";
        const dados = snapshot.val();

        if (!dados) {
            listaContainer.innerHTML = "<p style='grid-column: 1/-1;'>Nenhum item cadastrado. Use o console para injetar a lista.</p>";
            return;
        }

        // Transforma o objeto do Firebase em cards na tela
        Object.keys(dados).forEach(id => {
            const item = dados[id];
            const div = document.createElement('div');
            
            // Define a classe CSS baseada na disponibilidade
            div.className = `item-presente ${!item.disponivel ? 'comprado' : ''}`;
            
            div.innerHTML = `
                <h3>${item.nome}</h3>
                <p style="font-size: 0.85rem; color: ${item.disponivel ? '#27ae60' : '#888'}">
                    ${item.disponivel ? '✅ Disponível' : '🎁 Escolhido por ' + item.quem}
                </p>
                <button 
                    ${!item.disponivel ? 'disabled style="background:#ccc; cursor:not-allowed"' : ''} 
                    onclick="window.escolherItem('${id}', '${item.nome}')">
                    ${item.disponivel ? 'Escolher Presente' : 'Já Escolhido'}
                </button>
            `;
            listaContainer.appendChild(div);
        });
    });
}

// 5. FUNÇÃO PARA RESERVAR O PRESENTE (Global para o botão funcionar)
window.escolherItem = (id, nome) => {
    const quem = prompt(`Você escolheu: ${nome}\nDigite seu nome para confirmar a escolha:`);
    
    if (quem && quem.trim() !== "") {
        update(ref(db, 'presentes/' + id), {
            disponivel: false,
            quem: quem.trim()
        }).then(() => {
            alert("Obrigado! O item foi reservado na sua lista.");
        }).catch(err => {
            alert("Erro ao reservar: " + err.message);
        });
    } else if (quem === "") {
        alert("Você precisa digitar um nome para reservar o presente.");
    }
};