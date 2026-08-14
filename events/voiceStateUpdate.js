const { ChannelType, PermissionFlagsBits } = require("discord.js");
const { getGuildData } = require("../database/db");
const { enviarLog } = require("../utils/logs");

// callsCriadas: guarda quais canais foram criados pelo bot (em memória)
const callsCriadas = new Set();

module.exports = {
  name: "voiceStateUpdate",
  async execute(oldState, newState) {
    const guild = newState.guild || oldState.guild;
    const config = getGuildData("callconfig", guild.id, null);
    if (!config || !config.gatilho) return;

    // Usuário entrou no canal gatilho -> cria call nova
    if (newState.channelId === config.gatilho && newState.channelId !== oldState.channelId) {
      const membro = newState.member;
      const canal = await guild.channels.create({
        name: `・call-${membro.user.username}`,
        type: ChannelType.GuildVoice,
        parent: config.categoria || newState.channel.parentId || null,
        permissionOverwrites: [
          {
            id: membro.id,
            allow: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.MoveMembers],
          },
        ],
      });

      callsCriadas.add(canal.id);
      await membro.voice.setChannel(canal).catch(() => {});
      enviarLog(guild, "call", `🔊 Call criada por ${membro.user} — **${canal.name}**`);
    }

    // Usuário saiu de um canal criado -> verifica se ficou vazio
    if (oldState.channelId && callsCriadas.has(oldState.channelId)) {
      const canalAntigo = oldState.channel;
      if (canalAntigo && canalAntigo.members.size === 0) {
        callsCriadas.delete(canalAntigo.id);
        enviarLog(guild, "call", `🔊 Call **${canalAntigo.name}** foi deletada por estar vazia.`);
        await canalAntigo.delete().catch(() => {});
      }
    }
  },
};
