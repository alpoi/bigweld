import DiscordClient from "../client";
import { ChatInputCommandInteraction, GuildMember } from "discord.js";
import { VoiceConnection, VoiceConnectionStatus, entersState, joinVoiceChannel, getVoiceConnections } from "@discordjs/voice";
import {
    BigweldAlreadyPresent, BigweldElsewhere,
    BigweldVoiceChannelNull,
    UserVoiceChannelMismatch,
    UserVoiceChannelNull
} from "../errors";

export default class VoiceService {
    public client: DiscordClient;
    public voiceConnection?: VoiceConnection | null;
    public channelId?: string | null;

    constructor(client: DiscordClient) {
        this.client = client;
    }

    private async setConnection(connection: VoiceConnection) : Promise<void> {
        if (this.voiceConnection) await this.destroyConnection();
        this.voiceConnection = connection;
    }

    private async destroyConnection() : Promise<void> {
        this.voiceConnection?.destroy();
        this.voiceConnection = null;
    }

    private async destroyAllConnections(group: string = "default") : Promise<void> {
        const connections: Map<string, VoiceConnection> | undefined = getVoiceConnections(group);
        if (connections) connections.forEach((conn: VoiceConnection) => conn.destroy());
    }

    public async ensureUserConnectedWithBigweld(interaction: ChatInputCommandInteraction) : Promise<void> {
        const member: GuildMember = interaction.member as GuildMember;

        if (!member.voice.channelId) throw new UserVoiceChannelNull();
        if (!this.channelId) throw new BigweldVoiceChannelNull();
        if (member.voice.channelId !== this.channelId) throw new UserVoiceChannelMismatch();
    }

    async pausePlayback(interaction: ChatInputCommandInteraction) : Promise<void> {
        await this.ensureUserConnectedWithBigweld(interaction)
        // TODO implement
    }

    async resumePlayback(interaction: ChatInputCommandInteraction) : Promise<void> {
        await this.ensureUserConnectedWithBigweld(interaction)
        // TODO implement
    }

    async joinVoiceChannel(interaction: ChatInputCommandInteraction) : Promise<void> {
        const member: GuildMember = interaction.member as GuildMember;

        if (!member.voice.channelId) throw new UserVoiceChannelNull();
        if (this.channelId === member.voice.channelId) throw new BigweldAlreadyPresent();
        if (this.channelId && this.channelId !== member.voice.channelId) throw new BigweldElsewhere();

        const connection: VoiceConnection = joinVoiceChannel({
            channelId: member.voice.channelId,
            guildId: interaction.guildId!,
            adapterCreator: interaction.guild!.voiceAdapterCreator
        });

        this.channelId = member.voice.channelId;
        await this.setConnection(connection);
    }

    async leaveVoiceChannel(interaction: ChatInputCommandInteraction) : Promise<void> {
        await this.ensureUserConnectedWithBigweld(interaction);
        if (!this.channelId) throw new BigweldVoiceChannelNull();
        this.channelId = null;
    }
}