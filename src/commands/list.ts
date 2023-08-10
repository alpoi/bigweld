import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import BigweldClient from "../client";
import Command from "../models/command";
import Track from "../models/track";


const handler = (client: BigweldClient) => async (interaction: ChatInputCommandInteraction) : Promise<void> => {
    await client.messageService.deferReply(interaction, false);
    const nowPlaying: Track | undefined = client.voiceService.nowPlaying;
    const tracks: Track[] = client.voiceService.tracks;
    const paused: boolean = client.voiceService.isPaused();

    // TODO extract into embed builder
    if (tracks && nowPlaying) {
        await client.messageService.rawReply(interaction, `something playing, something queued, paused? ${paused}`, false);
    } else if (nowPlaying) {
        await client.messageService.rawReply(interaction, `something playing, nothing queued, paused? ${paused}`, false);
    } else {
        await client.messageService.rawReply(interaction, 'nothing playing', false);
    }
}

const builder: SlashCommandBuilder = new SlashCommandBuilder()
    .setName('list')
    .setDescription('Bigweld will list the upcoming tracks');

export default new Command(builder, handler);
