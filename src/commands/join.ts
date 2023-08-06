import { ChatInputCommandInteraction, GuildMember } from "discord.js";
import { joinVoiceChannel, getVoiceConnection, VoiceConnection } from "@discordjs/voice";
import { interactionError } from "../helpers/error";
import Command from "./command";
import DiscordClient from "../client";


// @ts-ignore
const execute = (client: DiscordClient) => async (interaction: ChatInputCommandInteraction) : Promise<void> => {
    await interaction.deferReply({ ephemeral: true });
    const member: GuildMember = interaction.member as GuildMember;

    if (!member.voice.channel) {
        await interaction.followUp({ content: 'Bigweld does not know which channel to join', ephemeral: true });
        return;
    }

    if (!interaction.guild) {
        await interactionError(interaction, "Expected interaction.guild to be non-null", { interaction });
        return;
    }

    const existingConnection: VoiceConnection | undefined = getVoiceConnection(interaction.guild.id);

    if (existingConnection && existingConnection.joinConfig.channelId === member.voice.channelId) {
        await interaction.followUp({content: 'Bigweld is already here', ephemeral: true});
        return;
    }

    if (existingConnection) {
        existingConnection.disconnect();
        existingConnection.destroy();
    }

    joinVoiceChannel({
        channelId: member.voice.channel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator
    });

}


export default new Command(
    'join',
    'Bigweld will join the voice channel',
    execute
);