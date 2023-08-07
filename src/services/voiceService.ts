import DiscordClient from "../client";
import { ChatInputCommandInteraction, GuildMember } from "discord.js";
import {
    VoiceConnection,
    VoiceConnectionStatus,
    entersState,
    joinVoiceChannel,
    getVoiceConnections
} from "@discordjs/voice";

export default class VoiceService {
    public client: DiscordClient;
    public voiceConnection: VoiceConnection | undefined = undefined;
    public channelId: string | undefined = undefined;

    constructor(client: DiscordClient) {
        this.client = client;
    }

    private async setConnection(connection: VoiceConnection) : Promise<void> {
        if (this.voiceConnection) {
            await this.destroyConnection();
        }
        this.voiceConnection = connection;
    }

    private async destroyConnection() : Promise<void> {
        this.voiceConnection?.destroy();
        this.voiceConnection = undefined;
    }

    private async destroyAllConnections(group: string = "default") : Promise<void> {
        const connections: Map<string, VoiceConnection> | undefined = getVoiceConnections(group);
        if (connections) {
            connections.forEach((conn: VoiceConnection) => conn.destroy());
        }
    }

    public async userConnectedWithBigweld(interaction: ChatInputCommandInteraction) : Promise<boolean> {
        const member: GuildMember = interaction.member as GuildMember;

        if (!member.voice.channelId) {
            await this.client.messageService.userNotInAnyVoiceChannelMessage(interaction);
        } else if (!this.channelId) {
            await this.client.messageService.notInVoiceChannelMessage(interaction);
        } else if (member.voice.channelId !== this.channelId) {
            await this.client.messageService.userNotInGivenVoiceChannelMessage(interaction, this.channelId);
        } else {
            return true;
        }

        return false;
    }

    async pausePlayback(interaction: ChatInputCommandInteraction) : Promise<void> {
        if (!await this.userConnectedWithBigweld(interaction)) {
            return;
        }

        // TODO implement
        await this.client.messageService.pausedPlaybackMessage(interaction);

    }

    async resumePlayback(interaction: ChatInputCommandInteraction) : Promise<void> {
        if (!await this.userConnectedWithBigweld(interaction)) {
            return;
        }

        // TODO implement
        await this.client.messageService.resumedPlaybackMessage(interaction);
    }

    async joinVoiceChannel(interaction: ChatInputCommandInteraction) : Promise<void> {
        const member: GuildMember = interaction.member as GuildMember;

        if (!member.voice.channelId) {
            await this.client.messageService.userNotInAnyVoiceChannelMessage(interaction);
        } else if (this.voiceConnection && this.channelId === member.voice.channelId) {
            await this.client.messageService.alreadyInVoiceChannelMessage(interaction);
        } else if (this.voiceConnection) {
            await this.client.messageService.inAnotherVoiceChannelMessage(interaction);
        } else {
            const connection: VoiceConnection = joinVoiceChannel({
                channelId: member.voice.channelId,
                guildId: interaction.guildId!,
                adapterCreator: interaction.guild!.voiceAdapterCreator
            });
            this.channelId = member.voice.channelId;
            await this.setConnection(connection);
            await this.client.messageService.joinedVoiceChannelMessage(interaction);
        }
    }

    async leaveVoiceChannel(interaction: ChatInputCommandInteraction) : Promise<void> {
        if (!await this.userConnectedWithBigweld(interaction)) {
            return;
        }

        if (this.voiceConnection) {
            await this.destroyConnection();
            await this.client.messageService.leftVoiceChannelMessage(interaction);
        } else {
            await this.client.messageService.notInVoiceChannelMessage(interaction);
        }

        this.channelId = undefined;
    }
}