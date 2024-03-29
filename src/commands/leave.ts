import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import BigweldClient from "../client";
import Command from "../models/command";

const handler = (client: BigweldClient) => async (interaction: ChatInputCommandInteraction) : Promise<void> => {
    await client.messageService.deferReply(interaction, false);

    if (client.voiceService.channelId && client.voiceService.connection) {
        client.voiceService.leave();
        await client.messageService.leaveReply(interaction);
    } else {
        await client.messageService.errorEmbedReply(interaction, "Bigweld is not here", false);
    }
}

const builder: SlashCommandBuilder = new SlashCommandBuilder()
    .setName('leave')
    .setDescription('Bigweld will leave the voice channel');

export default new Command(builder, handler);
