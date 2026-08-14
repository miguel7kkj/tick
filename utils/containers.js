const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
} = require("discord.js");

const CORES = {
  padrao: 0x2b2d31,
  sucesso: 0x57f287,
  erro: 0xed4245,
  aviso: 0xfee75c,
  info: 0x5865f2,
};

function baseContainer(texto, cor = CORES.padrao) {
  const container = new ContainerBuilder().setAccentColor(cor);
  container.addTextDisplayComponents(new TextDisplayBuilder().setContent(texto));
  return container;
}

function containerSucesso(texto) {
  return baseContainer(`✅ ${texto}`, CORES.sucesso);
}

function containerErro(texto) {
  return baseContainer(`⚠️ ${texto}`, CORES.erro);
}

function containerInfo(texto) {
  return baseContainer(texto, CORES.info);
}

function payload(containers) {
  const lista = Array.isArray(containers) ? containers : [containers];
  return { components: lista, flags: MessageFlags.IsComponentsV2 };
}

module.exports = {
  CORES,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  baseContainer,
  containerSucesso,
  containerErro,
  containerInfo,
  payload,
};
