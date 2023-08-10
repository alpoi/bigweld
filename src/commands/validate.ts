import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { validate } from "play-dl";
import Command from "../models/command";
import BigweldClient from "../client";


const handler = (client: BigweldClient) => async (interaction: ChatInputCommandInteraction) : Promise<void> => {
    await client.messageService.deferReply(interaction, false);
    const queryString: string | null = interaction.options.getString('query');
    if (queryString) {
        const res: boolean | string = await validate(queryString)
        await client.messageService.rawReply(interaction, res.toString());
    } else {
        await client.messageService.errorMessage(interaction);
    }
}

const builder: SlashCommandBuilder = new SlashCommandBuilder()
    .setName('validate')
    .setDescription('Bigweld will validate a query, returning anything it finds')
    .addStringOption(option =>
        option.setName('query')
            .setDescription('A search term or audio url for YouTube, SoundCloud or Spotify')
            .setRequired(true)
    ) as SlashCommandBuilder;

export default new Command(builder, handler);