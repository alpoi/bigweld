import { ChatInputCommandInteraction, GuildMember, VoiceChannel } from "discord.js";
import Command from "../models/command";
import BigweldClient from "../client";


const joinHandler = (client: BigweldClient) => async (interaction: ChatInputCommandInteraction) : Promise<void> => {
    await client.messageService.deferReply(interaction, true);
    const member: GuildMember = interaction.member as GuildMember;
    const channel: VoiceChannel | null = member.voice.channel as VoiceChannel;
    if (!channel) {
        // TODO handle null case
    }
    await client.voiceService.join(channel);
}

export default new Command(
    'join',
    'Bigweld will join the voice channel',
    joinHandler
);