import { ChatInputCommandInteraction, GuildMember, SlashCommandBuilder } from "discord.js";
import BigweldClient from "../client";
import Command from "../models/command";


const handler = (client: BigweldClient) => async (interaction: ChatInputCommandInteraction) : Promise<void> => {
    await client.messageService.deferReply(interaction, true);
    const member: GuildMember = interaction.member as GuildMember;

    if (!client.voiceService.memberConnectedWithBigweld(member)) {
        await client.messageService.bigweldCannotHearYou(interaction);
        return;
    }

    // TODO extract into embed builder
    if (!client.voiceService.nowPlaying) {
        await client.messageService.errorEmbedReply(interaction, "You cannot pause the voices inside your head", true);
    } else if (client.voiceService.isPaused()) {
        await client.messageService.errorEmbedReply(interaction, "The music is already paused", true);
    } else {
        client.voiceService.pause();
        await client.messageService.neutralEmbedReply(interaction, "The music is now paused", false);
    }
}

const builder: SlashCommandBuilder = new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Bigweld will pause the music');

export default new Command(builder, handler);
