const { containerInfo, payload } = require("../../utils/containers");

module.exports = {
  name: "comandos",
  async execute(mensagem) {
    const texto = `## Comandos do Tick

**Configuração** (Administrador)
\`/configurar call\` — define o canal que cria calls automáticas
\`/configurar logs\` — define os canais de log
\`/configurar ticket\` — abre o construtor do sistema de tickets
\`/configurar cargos\` — define cargos do histórico e autorole

**Moderação**
\`/ban\`, \`/kick\`, \`/mute\`, \`/warn adicionar\`, \`/warn remover\`, \`/warn listar\`
\`!ban\`, \`!kick\`, \`!mute\`, \`!warn\`, \`!warnremove\`

**Utilidade**
\`!historico @membro\` — mostra os cargos que a pessoa já teve
\`!sync\` — sincroniza os comandos de barra (apenas dono do servidor)
\`!comandos\` — mostra essa lista

**Containers**
\`/container criar\` — monta e envia containers personalizados via webhook`;

    await mensagem.reply(payload(containerInfo(texto)));
  },
};
