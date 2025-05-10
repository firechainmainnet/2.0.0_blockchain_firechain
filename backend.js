// backend.js — FireChain backend seguro com proteção antiflood 🔥

import admin from 'firebase-admin';
import chalk from 'chalk';
import fs from 'fs';

// ------------------------------- INIT FIREBASE -------------------------------
const serviceAccount = JSON.parse(fs.readFileSync('./AccountService.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://firechaintech-default-rtdb.firebaseio.com/',
});

const db = admin.database();
const usersRef = db.ref('users');
console.log(chalk.blue.bold('\n🚀 FireChain Backend Online — aguardando requisições dos usuários...'));

// --------------------------- LIMITE DE REQUISIÇÕES ---------------------------
const rateMap = new Map(); // { uid: { count, tsStart, lastAlerted } }
const MAX_REQ = 5;
const WINDOW_MS = 10000;

// ---------------------------- INICIALIZAÇÃO BASE -----------------------------
await cleanStaleData();

usersRef.once('value', snapshot => {
  snapshot.forEach(userSnap => listenToRequests(userSnap.key));
});
usersRef.on('child_added', userSnap => {
  listenToRequests(userSnap.key);
});

// ---------------------------- MONITORAMENTO RTDB -----------------------------
function listenToRequests(uid) {
  const reqRef = db.ref(`users/${uid}/requests`);
  console.log(chalk.gray(`👤 Monitorando requisições de: ${uid}`));

  reqRef.on('child_added', async reqSnap => {
    const reqId = reqSnap.key;
    const data = reqSnap.val();
    const resRef = db.ref(`users/${uid}/responses/${reqId}`);

    const now = Date.now();
    const rate = rateMap.get(uid) || { count: 0, tsStart: now, lastAlerted: false };

    if (now - rate.tsStart > WINDOW_MS) {
      rate.count = 1;
      rate.tsStart = now;
      rate.lastAlerted = false;
    } else {
      rate.count++;
    }

    // ➤ BLOQUEIO: Excedeu o limite
    if (rate.count > MAX_REQ) {
      if (!rate.lastAlerted) {
        await escreverResposta(resRef, { erro: '⚠️ Limite de requisições excedido. Tente novamente em alguns segundos.' });
        rate.lastAlerted = true;
      }
      await reqSnap.ref.remove(); // Remoção silenciosa do excesso
      return;
    }

    rateMap.set(uid, rate);

    console.log(chalk.yellowBright(`\n📥 Requisição recebida [${uid}/${reqId}] — Ação: ${data?.action || 'desconhecida'}`));

    try {
      if (!data || !data.action) throw new Error('Requisição inválida ou sem campo "action"');

      switch (data.action) {
        case 'criar_perfil':
          const nomeCriar = sanitizeString(data.nome, 32);
          if (nomeCriar.length < 2) throw new Error('Nome inválido');
          await criarPerfil(uid, nomeCriar);
          await escreverResposta(resRef, { status: 'criado', nome: nomeCriar });
          logSuccess('✅ Perfil criado com segurança', nomeCriar);
          break;

        case 'ver_perfil':
          const perfilSnap = await db.ref(`users/${uid}/perfil`).get();
          if (!perfilSnap.exists()) {
            await escreverResposta(resRef, { status: 'nao_encontrado' });
            logInfo('Perfil não encontrado');
          } else {
            await escreverResposta(resRef, { perfil: perfilSnap.val() });
            logSuccess('✅ Perfil retornado', JSON.stringify(perfilSnap.val()));
          }
          break;

        case 'atualizar_perfil':
          const nome = sanitizeString(data.nome, 32);
          const bio = sanitizeString(data.bio || '', 200);
          if (nome.length < 2) throw new Error('Nome inválido');

          const perfilRef = db.ref(`users/${uid}/perfil`);
          const perfilAtual = (await perfilRef.get()).val() || {};

          const atualizado = {
            nome,
            bio,
            emailVerificado: perfilAtual.emailVerificado ?? false,
            criadoEm: perfilAtual.criadoEm || Date.now(),
            atualizadoEm: Date.now()
          };

          await perfilRef.set(atualizado);
          await escreverResposta(resRef, { status: 'atualizado', perfil: atualizado });
          logSuccess('✅ Perfil atualizado com segurança', nome);
          break;

        default:
          await escreverResposta(resRef, { erro: 'Ação desconhecida' });
          logWarn(`⚠️ Ação desconhecida: ${data.action}`);
      }
    } catch (err) {
      await escreverResposta(resRef, { erro: err.message });
      console.error(chalk.redBright(`❌ Erro: ${err.message}`));
    } finally {
      await reqSnap.ref.remove();
    }
  });
}

// ------------------------------- FUNÇÕES AUXILIARES -------------------------------
async function criarPerfil(uid, nome) {
  const perfilRef = db.ref(`users/${uid}/perfil`);
  const snap = await perfilRef.get();
  if (snap.exists()) throw new Error('Perfil já existe');

  const novoPerfil = {
    nome,
    bio: '',
    emailVerificado: false,
    criadoEm: Date.now(),
    atualizadoEm: Date.now()
  };

  await perfilRef.set(novoPerfil);
}

function sanitizeString(str, maxLength) {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/<[^>]*>?/gm, '') // remove HTML
    .replace(/script/gi, '')
    .replace(/["']/g, '')      // remove aspas
    .slice(0, maxLength);
}

async function escreverResposta(ref, data) {
  await ref.set(data);
  setTimeout(() => ref.remove().then(() => {
    console.log(chalk.gray(`🕒 Resposta expirada e removida: ${ref.key}`));
  }), 15000);
}

async function cleanStaleData() {
  console.log(chalk.gray('🧼 Limpando dados órfãos...'));
  const usersSnap = await usersRef.get();

  for (const uid in usersSnap.val() || {}) {
    const userNode = usersSnap.child(uid);
    const reqs = userNode.child('requests').val() || {};
    const resps = userNode.child('responses').val() || {};

    for (const reqId in reqs) {
      await db.ref(`users/${uid}/requests/${reqId}`).remove();
      console.log(chalk.yellow(`🗑️ Limpando request pendente: ${uid}/${reqId}`));
    }

    for (const resId in resps) {
      await db.ref(`users/${uid}/responses/${resId}`).remove();
      console.log(chalk.yellow(`🗑️ Limpando response órfã: ${uid}/${resId}`));
    }
  }

  console.log(chalk.green('✅ Limpeza inicial completa.'));
}

function logSuccess(msg, extra = '') {
  console.log(chalk.greenBright(msg), chalk.gray(extra));
}
function logInfo(msg) {
  console.log(chalk.cyan(`ℹ️ ${msg}`));
}
function logWarn(msg) {
  console.log(chalk.keyword('orange')(msg));
}
