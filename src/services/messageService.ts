import DiscordClient from "../client";
import { ChatInputCommandInteraction, InteractionReplyOptions } from "discord.js";
import Track from "../models/track";

export default class MessageService {
    public client: DiscordClient;

    constructor(client: DiscordClient) {
        this.client = client;
    }

    private async interactionReply(interaction: ChatInputCommandInteraction, options: InteractionReplyOptions) : Promise<void> {
        if (interaction.deferred || interaction.replied) {
            await interaction.followUp(options);
        } else {
            await interaction.reply(options);
        }
    };

    public async deferReply(interaction: ChatInputCommandInteraction, ephemeral: boolean = false) : Promise<void> {
        await interaction.deferReply({ ephemeral })
    }

    public async leftVoiceChannelMessage(interaction: ChatInputCommandInteraction) : Promise<void> {
        await this.interactionReply(interaction,
            { content: `Bigweld has left ${interaction.channel!.id}`, ephemeral: false }
        );
    }

    public async joinedVoiceChannelMessage(interaction: ChatInputCommandInteraction) : Promise<void> {
        await this.interactionReply(interaction,
            { content: `Bigweld has joined ${interaction.channel!.id}`, ephemeral: false }
        );
    }

    public async userNotInAnyVoiceChannelMessage(interaction: ChatInputCommandInteraction) : Promise<void> {
        await this.interactionReply(interaction,
            { content: `Bigweld expected you to be in a voice channel`, ephemeral: true }
        );
    }

    public async userNotInGivenVoiceChannelMessage(interaction: ChatInputCommandInteraction, channel: string) : Promise<void> {
        await this.interactionReply(interaction,
            { content: `Bigweld expected you to be in "${channel}"`, ephemeral: true }
        );
    }

    public async alreadyInVoiceChannelMessage(interaction: ChatInputCommandInteraction) : Promise<void> {
        await this.interactionReply(interaction,
            { content: "Bigweld is already in the voice channel", ephemeral: true }
        );
    }

    public async inAnotherVoiceChannelMessage(interaction: ChatInputCommandInteraction) : Promise<void> {
        await this.interactionReply(interaction,
            { content: "Bigweld is busy in another voice channel", ephemeral: true }
        );
    }

    public async notInVoiceChannelMessage(interaction: ChatInputCommandInteraction) : Promise<void> {
        await this.interactionReply(interaction,
            { content: "Bigweld is not in a voice channel", ephemeral: true }
        );
    }

    public async pongMessage(interaction: ChatInputCommandInteraction) : Promise<void> {
        await this.interactionReply(interaction,
            { content: "Bigweld hits the ball back", ephemeral: false }
        );
    }

    public async nothingPlayingMessage(interaction: ChatInputCommandInteraction) : Promise<void> {
        await this.interactionReply(interaction,
            { content: "Nothing is playing", ephemeral: false }
        );
    }

    public async skippedTrackMessage(interaction: ChatInputCommandInteraction, track: Track) : Promise<void> {
        await this.interactionReply(interaction,
            { content: "Track skipped", ephemeral: false }
        );
    }

    public async nowPlayingMessage(interaction: ChatInputCommandInteraction, track: Track) : Promise<void> {
        await this.interactionReply(interaction,
            { content: "Now playing", ephemeral: false }
        );
    }

    public async addedTrackMessage(interaction: ChatInputCommandInteraction, track: Track) : Promise<void> {
        await this.interactionReply(interaction,
            { content: "Added to queue", ephemeral: false }
        );
    }

    public async addedTracksMessage(interaction: ChatInputCommandInteraction, tracks: Track[]) : Promise<void> {
        await this.interactionReply(interaction,
            { content: "Added lots of things to queue", ephemeral: false }
        );
    }

    public async removedTrackMessage(interaction: ChatInputCommandInteraction, track: Track) : Promise<void> {
        await this.interactionReply(interaction,
            { content: "Removed from queue", ephemeral: false }
        );
    }

    public async noSuchTrackMessage(interaction: ChatInputCommandInteraction) : Promise<void> {
        await this.interactionReply(interaction,
            { content: "Could not find track", ephemeral: false }
        );
    }

    public async listTracksMessage(interaction: ChatInputCommandInteraction) : Promise<void> {
        await this.interactionReply(interaction,
            { content: "Here are all the tracks", ephemeral: false }
        );
    }

    public async noResultsMessage(interaction: ChatInputCommandInteraction) : Promise<void> {
        await this.interactionReply(interaction,
            { content: "No results", ephemeral: false }
        );
    }

    public async pausedPlaybackMessage(interaction: ChatInputCommandInteraction) : Promise<void> {
        await this.interactionReply(interaction,
            { content: "Paused", ephemeral: false }
        );
    }

    public async resumedPlaybackMessage(interaction: ChatInputCommandInteraction) : Promise<void> {
        await this.interactionReply(interaction,
            { content: "Resumed", ephemeral: false }
        );
    }
}