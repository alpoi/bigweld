import { ChatInputCommandInteraction } from "discord.js";
import Command from "../models/command";
import DiscordClient from "../client";


const joinHandler = (client: DiscordClient) => async (interaction: ChatInputCommandInteraction) : Promise<void> => {
    await client.messageService.deferReply(interaction, true);
    await client.voiceService.joinVoiceChannel(interaction);
}

export default new Command(
    'join',
    'Bigweld will join the voice channel',
    joinHandler
);