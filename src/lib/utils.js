// src/lib/utils.js
import chalk from 'chalk';

/**
 * Sanitiza uma string removendo tags HTML, scripts, aspas e limitando tamanho.
 * @param {string} str - Texto a ser sanitizado.
 * @param {number} maxLength - Tamanho máximo permitido.
 * @returns {string}
 */
export function sanitizeString(str, maxLength) {
  if (typeof str !== 'string') return '';

  return str
    .trim()
    .replace(/<[^>]*>?/gm, '')                  // Remove tags HTML
    .replace(/(script|eval|SELECT|INSERT|DELETE|--)/gi, '') // Bloqueia palavras-chave perigosas
    .replace(/["']/g, '')                       // Remove aspas simples e duplas
    .slice(0, maxLength);
}

/**
 * Log de sucesso (verde)
 */
export function logSuccess(msg, extra = '') {
  console.log(chalk.greenBright(`✅ ${msg}`), chalk.gray(extra));
}

/**
 * Log de informação (azul)
 */
export function logInfo(msg) {
  console.log(chalk.cyan(`ℹ️ ${msg}`));
}

/**
 * Log de alerta (amarelo/laranja)
 */
export function logWarn(msg) {
  console.log(chalk.keyword('orange')(`⚠️ ${msg}`));
}

/**
 * Log de erro (vermelho)
 */
export function logError(msg) {
  console.log(chalk.redBright(`❌ ${msg}`));
}
