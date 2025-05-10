// src/handlers/processRequest.js
import { db } from '../lib/firebase.js';
import { sanitizeString, logSuccess, logInfo, logWarn } from '../lib/utils.js';

/**
 * Processa uma requisição baseada na ação.
 * @param {object} data - Payload completo do request.
 * @param {string} reqId - ID da requisição (chave do RTDB).
 * @returns {Promise<object>} - Resposta a ser enviada ao RTDB.
 */
export async function processRequest(data, reqId) {
  const { uid, action } = data;
  const perfilRef = db.ref(`users/${uid}/perfil`);

  switch (action) {
    case 'criar_perfil': {
      const nome = sanitizeString(data.nome, 32);
      if (nome.length < 2) throw new Error('Nome inválido');

      const snap = await perfilRef.get();
      if (snap.exists()) throw new Error('Perfil já existe');

      const perfil = {
        nome,
        bio: '',
        emailVerificado: false,
        criadoEm: Date.now(),
        atualizadoEm: Date.now()
      };

      await perfilRef.set(perfil);
      logSuccess(`Perfil criado para ${uid}`, nome);
      return { status: 'criado', nome };
    }

    case 'ver_perfil': {
      const snap = await perfilRef.get();
      if (!snap.exists()) {
        logInfo(`Perfil não encontrado para ${uid}`);
        return { status: 'nao_encontrado' };
      }

      const perfil = snap.val();
      logSuccess(`Perfil retornado`, JSON.stringify(perfil));
      return { perfil };
    }

    case 'atualizar_perfil': {
      const nome = sanitizeString(data.nome, 32);
      const bio = sanitizeString(data.bio || '', 200);
      if (nome.length < 2) throw new Error('Nome inválido');

      const perfilAtual = (await perfilRef.get()).val() || {};
      const atualizado = {
        nome,
        bio,
        emailVerificado: perfilAtual.emailVerificado ?? false,
        criadoEm: perfilAtual.criadoEm || Date.now(),
        atualizadoEm: Date.now()
      };

      await perfilRef.set(atualizado);
      logSuccess(`Perfil atualizado para ${uid}`, nome);
      return { status: 'atualizado', perfil: atualizado };
    }

    default:
      logWarn(`Ação desconhecida: ${action}`);
      return { erro: 'Ação desconhecida' };
  }
}
