import {ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import Command from "../models/command";
import BigweldClient from "../client";

const handler = (client: BigweldClient) => async (interaction: ChatInputCommandInteraction) : Promise<void> => {
    await client.messageService.deferReply(interaction);
    await client.messageService.rawReply(interaction, "pong");
}

const builder: SlashCommandBuilder = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Bigweld will say pong');

export default new Command(builder, handler);
