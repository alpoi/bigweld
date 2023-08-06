import { ChatInputCommandInteraction } from "discord.js";
import { interactionError } from "../helpers/error";
import { getVoiceConnection, VoiceConnection } from "@discordjs/voice";
import DiscordClient from "../client";
import Command from "./command";

// @ts-ignore
const execute = (client: DiscordClient) => async (interaction: ChatInputCommandInteraction) : Promise<void> => {
    await interaction.deferReply({ ephemeral: true });

    if (!interaction.guild) {
        await interactionError(interaction, "Expected interaction.guild to be non-null", { interaction });
        return;
    }

    const existingConnection: VoiceConnection | undefined = getVoiceConnection(interaction.guild.id);

    if (!existingConnection) {
        await interaction.followUp({ content: "Bigweld is not here", ephemeral: true });
        return;
    }

    existingConnection.disconnect();
    existingConnection.destroy();
}

export default new Command(
    'leave',
    'Bigweld will leave the voice channel',
    execute
);