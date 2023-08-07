import DiscordClient from "../client";
import Track from "../models/track";
import {ChatInputCommandInteraction} from "discord.js";

export default class TrackService {
    public client: DiscordClient;
    public nowPlaying: Track | undefined;
    public tracks: Track[];

    constructor(client: DiscordClient) {
        this.client = client;
        this.nowPlaying = undefined;
        this.tracks = []
    }

    async listTracks(interaction: ChatInputCommandInteraction) : Promise<void> {
        await this.client.messageService.listTracksMessage(interaction);
    }

    async addTracks(interaction: ChatInputCommandInteraction) : Promise<void> {
        if (!await this.client.voiceService.userConnectedWithBigweld(interaction)) return;

        const tracks: Track[] = []; // TODO parse interaction to get track details and use play-dl

        this.tracks.concat(tracks);

        if (tracks.length == 0) {
            await this.client.messageService.noResultsMessage(interaction);
        } else if (tracks.length == 1) {
            await this.client.messageService.addedTrackMessage(interaction, tracks.pop()!)
        } else {
            await this.client.messageService.addedTracksMessage(interaction, tracks);
        }
    }

    async removeTrack(interaction: ChatInputCommandInteraction) : Promise<void> {
        if (!await this.client.voiceService.userConnectedWithBigweld(interaction)) return;
        const trackNumber: number = 0; // TODO parse interaction to get track number
        const track: Track | undefined = this.tracks.at(trackNumber);

        if (!track) {
            await this.client.messageService.noSuchTrackMessage(interaction);
            return;
        }

        this.tracks.splice(trackNumber, 1)
        await this.client.messageService.removedTrackMessage(interaction, track);
    }

    async clearTracks(interaction: ChatInputCommandInteraction) : Promise<void> {
        if (!await this.client.voiceService.userConnectedWithBigweld(interaction)) return;
        this.tracks = [];
    }

    async skipTrack(interaction: ChatInputCommandInteraction) : Promise<void> {
        if (!await this.client.voiceService.userConnectedWithBigweld(interaction)) return;

        if (!this.nowPlaying) {
            await this.client.messageService.nothingPlayingMessage(interaction);
        } else {
            const skipped: Track = this.nowPlaying;
            this.nowPlaying = this.tracks.shift();
            await this.client.messageService.skippedTrackMessage(interaction, skipped);

            if (this.nowPlaying) {
                await this.client.messageService.nowPlayingMessage(interaction, this.nowPlaying);
            }
        }
    }
}