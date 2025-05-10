import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  get
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const config = {
  apiKey: "AIzaSyBMmy8i6CUsDpKiLHQKWcSdT_P0txz0lPI",
  authDomain: "firechaintech.firebaseapp.com",
  databaseURL: "https://firechaintech-default-rtdb.firebaseio.com",
  projectId: "firechaintech",
  storageBucket: "firechaintech.firebasestorage.app",
  messagingSenderId: "670938370399",
  appId: "1:670938370399:web:5c58bc088ca81f064726ea"
};

const app = initializeApp(config);
const auth = getAuth(app);
const db = getDatabase(app);

const toastContainer = document.getElementById('toastContainer');
const authSection = document.getElementById('authSection');
const perfilSection = document.getElementById('perfilSection');
const nomeInput = document.getElementById('nome');
const bioInput = document.getElementById('bio');
const output = document.getElementById('perfilOutput');

onAuthStateChanged(auth, user => {
  if (user) {
    showToast(`✅ Logado como ${user.email}`, "success");
    authSection.classList.add('hidden');
    perfilSection.classList.remove('hidden');
    nomeInput.value = localStorage.getItem('firechain_nome') || '';
    bioInput.value = localStorage.getItem('firechain_bio') || '';
  } else {
    showToast("⚠️ Não autenticado", "error");
    authSection.classList.remove('hidden');
    perfilSection.classList.add('hidden');
  }
});

function criarConta() {
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value.trim();
  if (!email.includes('@')) return showToast("Email inválido", "error");
  if (senha.length < 6) return showToast("Senha muito curta", "error");
  showToast("Criando conta...", "loading");
  createUserWithEmailAndPassword(auth, email, senha)
    .then(() => showToast("Conta criada com sucesso!", "success"))
    .catch(err => showToast(err.message, "error"));
}

function login() {
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value.trim();
  if (!email.includes('@') || senha.length < 6)
    return showToast("Email ou senha inválidos", "error");
  showToast("Entrando...", "loading");
  signInWithEmailAndPassword(auth, email, senha)
    .then(() => showToast("Login realizado!", "success"))
    .catch(err => showToast(err.message, "error"));
}

function logout() {
  signOut(auth);
  showToast("Desconectado", "info");
}

function gerarReqId() {
  return 'req_' + Date.now();
}

function enviarRequisicao(action, dataExtra = {}) {
  const user = auth.currentUser;
  if (!user) return showToast("Não autenticado", "error");

  const reqId = gerarReqId();
  const key = `${user.uid}_${reqId}`;
  const reqRef = ref(db, `requests/${key}`);
  const resRef = ref(db, `users/${user.uid}/responses/${key}`);

  const payload = {
    uid: user.uid,
    action,
    ...dataExtra
  };

  output.textContent = "⏳ Aguardando resposta...";
  set(reqRef, payload)
    .then(() => waitForResponse(resRef))
    .catch(err => showToast("Erro ao enviar: " + err.message, "error"));
}

async function waitForResponse(resRef) {
  const maxAttempts = 15;
  let attempts = 0;

  while (attempts < maxAttempts) {
    const snap = await get(resRef);
    if (snap.exists()) {
      const resp = snap.val();
      formatarResposta(resp);
      showToast("✅ Resposta recebida", "success");
      return;
    }
    await new Promise(r => setTimeout(r, 500));
    attempts++;
  }

  output.textContent = "⚠️ Tempo de resposta expirado.";
  showToast("Tempo de resposta expirado", "error");
}

function criarPerfil() {
  const nome = nomeInput.value.trim();
  if (nome.length < 2) return showToast("Nome inválido", "error");
  localStorage.setItem('firechain_nome', nome);
  enviarRequisicao("criar_perfil", { nome });
}

function atualizarPerfil() {
  const nome = nomeInput.value.trim();
  const bio = bioInput.value.trim();
  if (nome.length < 2) return showToast("Nome inválido", "error");
  if (bio.length > 200) return showToast("Bio muito longa", "error");
  localStorage.setItem('firechain_nome', nome);
  localStorage.setItem('firechain_bio', bio);
  enviarRequisicao("atualizar_perfil", { nome, bio });
}

function verPerfil() {
  enviarRequisicao("ver_perfil");
}

function formatarResposta(resp) {
  if (resp?.perfil) {
    const { nome, bio, criadoEm, atualizadoEm } = resp.perfil;
    output.textContent = `🧑 Nome: ${nome}
📝 Bio: ${bio || '—'}
📅 Criado em: ${formatarData(criadoEm)}
🕒 Atualizado em: ${formatarData(atualizadoEm)}`;
  } else {
    output.textContent = JSON.stringify(resp, null, 2);
  }
}

function formatarData(timestamp) {
  if (!timestamp) return '—';
  const d = new Date(timestamp);
  return d.toLocaleString('pt-BR');
}

function showToast(msg, type = "info") {
  const div = document.createElement('div');
  div.className = `toast ${type}`;
  div.textContent = msg;
  toastContainer.appendChild(div);
  setTimeout(() => div.remove(), 4000);
}

window.criarConta = criarConta;
window.login = login;
window.logout = logout;
window.criarPerfil = criarPerfil;
window.atualizarPerfil = atualizarPerfil;
window.verPerfil = verPerfil;
