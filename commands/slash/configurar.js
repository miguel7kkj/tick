const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
} = require("discord.js");

const configCall = require("../../handlers/configCall");
const configLogs = require("../../handlers/configLogs");
const configTicket = require("../../handlers/configTicket");
const configCargos = require("../../handlers/configCargos");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("configurar")
    .setDescription("Comandos de configuração do servidor")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((sub) =>
      sub
        .setName("call")
        .setDescription("Configura o canal que cria calls automáticas ao entrar")
        .addChannelOption((opt) =>
          opt
            .setName("canal-gatilho")
            .setDescription("Canal de voz que, ao ser acessado, cria uma call nova")
            .addChannelTypes(ChannelType.GuildVoice)
            .setRequired(true)
        )
        .addChannelOption((opt) =>
          opt
            .setName("categoria")
            .setDescription("Categoria onde as calls criadas vão aparecer")
            .addChannelTypes(ChannelType.GuildCategory)
            .setRequired(false)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("logs")
        .setDescription("Configura os canais de logs do servidor")
        .addStringOption((opt) =>
          opt
            .setName("tipo")
            .setDescription("Qual tipo de log você quer configurar")
            .setRequired(true)
            .addChoices(
              { name: "Cargos", value: "cargos" },
              { name: "Fotos (avatar/imagens)", value: "fotos" },
              { name: "Mensagens", value: "mensagens" },
              { name: "Bans", value: "bans" },
              { name: "Warns", value: "warns" },
              { name: "Mute", value: "mute" },
              { name: "Kick", value: "kick" },
              { name: "Ticket", value: "ticket" },
              { name: "Call", value: "call" },
              { name: "Canais", value: "canais" }
            )
        )
        .addChannelOption((opt) =>
          opt
            .setName("canal")
            .setDescription("Canal que vai receber esse log (deixe vazio para desativar)")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(false)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("ticket")
        .setDescription("Abre o painel de configuração do sistema de tickets")
    )
    .addSubcommand((sub) =>
      sub
        .setName("cargos")
        .setDescription("Adiciona ou remove cargos rastreados pelo !historico / autorole")
        .addStringOption((opt) =>
          opt
            .setName("acao")
            .setDescription("Adicionar ou remover")
            .setRequired(true)
            .addChoices(
              { name: "Adicionar cargo ao histórico", value: "add_historico" },
              { name: "Remover cargo do histórico", value: "remove_historico" },
              { name: "Definir cargo de autorole", value: "add_autorole" },
              { name: "Remover cargo de autorole", value: "remove_autorole" }
            )
        )
        .addRoleOption((opt) =>
          opt.setName("cargo").setDescription("Cargo alvo").setRequired(true)
        )
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    if (sub === "call") return configCall(interaction);
    if (sub === "logs") return configLogs(interaction);
    if (sub === "ticket") return configTicket(interaction);
    if (sub === "cargos") return configCargos(interaction);
  },
};
