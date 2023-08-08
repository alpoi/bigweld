import { ChatInputCommandInteraction } from "discord.js";
import BigweldClient from "../client";
import Command from "../models/command";

const leaveHandler = (client: BigweldClient) => async (interaction: ChatInputCommandInteraction) : Promise<void> => {
    await interaction.deferReply({ ephemeral: true });
    await client.voiceService.leaveVoiceChannel(interaction);
}

export default new Command(
    'leave',
    'Bigweld will leave the voice channel',
    leaveHandler
);