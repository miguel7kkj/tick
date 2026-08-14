// Armazenamento em memória (some se o bot reiniciar, é só para os builders temporários)
const ticketBuilders = new Map(); // userId -> configuração do painel sendo criado
const containerBuilders = new Map(); // userId -> containers sendo montados
const confirmacoesPendentes = new Map(); // id -> { acao, dados, expira }

function gerarId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function criarConfirmacao(dados, ttlMs = 60_000) {
  const id = gerarId();
  confirmacoesPendentes.set(id, dados);
  setTimeout(() => confirmacoesPendentes.delete(id), ttlMs);
  return id;
}

function pegarConfirmacao(id) {
  return confirmacoesPendentes.get(id);
}

function removerConfirmacao(id) {
  confirmacoesPendentes.delete(id);
}

module.exports = {
  ticketBuilders,
  containerBuilders,
  gerarId,
  criarConfirmacao,
  pegarConfirmacao,
  removerConfirmacao,
};
