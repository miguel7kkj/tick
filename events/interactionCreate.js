const { containerErro, payload } = require("../utils/containers");
const {
  handleTicketBuilderButton,
  handleTicketBuilderSelect,
  handleTicketBuilderModal,
  abrirTicket,
  fecharTicket,
} = require("../handlers/ticketInteractions");
const { handleContainerButton, handleContainerModal, handleContainerSelect } = require("../handlers/containerInteractions");
const moderationConfirm = require("../handlers/moderationConfirm");

module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    try {
      // Comandos de barra
      if (interaction.isChatInputCommand()) {
        const comando = interaction.client.slashCommands.get(interaction.commandName);
        if (!comando) return;
        return await comando.execute(interaction);
      }

      // Botões
      if (interaction.isButton()) {
        const id = interaction.customId;

        if (id.startsWith("ticket_cfg_")) return handleTicketBuilderButton(interaction);
        if (id.startsWith("ticket_open_btn_")) return abrirTicket(interaction, Number(id.split("_").pop()));
        if (id === "ticket_close") return fecharTicket(interaction);

        if (id.startsWith("cb_")) return handleContainerButton(interaction);

        if (id.startsWith("mod_confirm:") || id.startsWith("mod_cancel:")) return moderationConfirm(interaction);

        return;
      }

      // Select menus (string, canal, cargo)
      if (interaction.isAnySelectMenu()) {
        const id = interaction.customId;

        if (id === "ticket_open_select") return abrirTicket(interaction, Number(interaction.values[0]));
        if (id.startsWith("ticket_cfg_")) return handleTicketBuilderSelect(interaction);
        if (id.startsWith("cb_")) return handleContainerSelect(interaction);

        return;
      }

      // Modais
      if (interaction.isModalSubmit()) {
        const id = interaction.customId;

        if (id.startsWith("ticket_cfg_modal_")) return handleTicketBuilderModal(interaction);
        if (id.startsWith("cb_modal_")) return handleContainerModal(interaction);

        return;
      }
    } catch (erro) {
      console.error(erro);
      const conteudo = { ...payload(containerErro("Ocorreu um erro ao processar essa ação.")), ephemeral: true };
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp(conteudo).catch(() => {});
      } else {
        await interaction.reply(conteudo).catch(() => {});
      }
    }
  },
};
