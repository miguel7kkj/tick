const UNIDADES = {
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

const MAX_MUTE = 28 * 86_400_000; // limite do Discord

function parseDuracao(texto) {
  const match = /^(\d+)\s*(s|m|h|d)$/i.exec(texto.trim());
  if (!match) return null;
  const valor = parseInt(match[1], 10);
  const unidade = match[2].toLowerCase();
  const ms = valor * UNIDADES[unidade];
  if (ms <= 0 || ms > MAX_MUTE) return null;
  return ms;
}

module.exports = { parseDuracao, MAX_MUTE };
