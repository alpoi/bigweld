import { ChatInputCommandInteraction } from "discord.js";
import DiscordClient from "../client";
import Command from "../models/command";

const leaveHandler = (client: DiscordClient) => async (interaction: ChatInputCommandInteraction) : Promise<void> => {
    await interaction.deferReply({ ephemeral: true });
    await client.voiceService.leaveVoiceChannel(interaction);
}

export default new Command(
    'leave',
    'Bigweld will leave the voice channel',
    leaveHandler
);