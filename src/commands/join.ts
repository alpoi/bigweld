import { ChatInputCommandInteraction, GuildMember, SlashCommandBuilder, VoiceChannel } from "discord.js";
import Command from "../models/command";
import BigweldClient from "../client";


const handler = (client: BigweldClient) => async (interaction: ChatInputCommandInteraction) : Promise<void> => {
    await client.messageService.deferReply(interaction, false);
    const member: GuildMember = interaction.member as GuildMember;
    const channel: VoiceChannel | null = member.voice.channel as VoiceChannel;

    if (client.voiceService.memberConnectedWithBigweld(member)) {
        await client.messageService.errorEmbedReply(interaction, "Bigweld is already here");
    } else if (channel) {
        client.voiceService.textChannelId = interaction.channelId;
        client.voiceService.join(channel);
        await client.messageService.joinReply(interaction);
    } else {
        await client.messageService.errorEmbedReply(interaction, "You must join a channel first");
    }
}

const builder: SlashCommandBuilder = new SlashCommandBuilder()
    .setName('join')
    .setDescription('Bigweld will join the voice channel');

export default new Command(builder, handler);
