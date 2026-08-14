const { setGuildData } = require("../database/db");
const { containerSucesso, payload } = require("../utils/containers");

module.exports = async function configCall(interaction) {
  const gatilho = interaction.options.getChannel("canal-gatilho");
  const categoria = interaction.options.getChannel("categoria");

  setGuildData("callconfig", interaction.guild.id, {
    gatilho: gatilho.id,
    categoria: categoria ? categoria.id : null,
  });

  await interaction.reply({
    ...payload(
      containerSucesso(
        `Configuração salva! Sempre que alguém entrar em **${gatilho.name}**, uma call própria vai ser criada na hora, com o nome dela. Quando todo mundo sair, a call some sozinha.`
      )
    ),
    ephemeral: true,
  });
};
