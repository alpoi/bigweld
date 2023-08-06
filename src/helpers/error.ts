import { ChatInputCommandInteraction } from "discord.js";

export async function interactionError(interaction: ChatInputCommandInteraction, message: string, payload: object) {
    console.error(message);
    console.error(payload);
    await interaction.followUp({ content: 'An unexpected error occurred', ephemeral: true }); // TODO make this look prettier
}