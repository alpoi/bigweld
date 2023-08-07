import DiscordClient from "../client";
import Track from "../models/track";
import { ChatInputCommandInteraction } from "discord.js";
import { NothingPlayingError, TrackIndexError } from "../errors";

export default class TrackService {
    public client: DiscordClient;
    public nowPlaying: Track | undefined;
    public tracks: Track[];

    constructor(client: DiscordClient) {
        this.client = client;
        this.nowPlaying = undefined;
        this.tracks = []
    }

    async listTracks() : Promise<Track[]> {
        return this.tracks;
    }

    async addTracks(interaction: ChatInputCommandInteraction) : Promise<Track[]> {
        await this.client.voiceService.ensureUserConnectedWithBigweld(interaction);
        const tracks: Track[] = []; // TODO parse interaction to get track details and use play-dl
        this.tracks.concat(tracks);
        return tracks;
    }

    async removeTrack(interaction: ChatInputCommandInteraction) : Promise<Track> {
        await this.client.voiceService.ensureUserConnectedWithBigweld(interaction);
        const trackNumber: number = 0; // TODO parse interaction to get track number
        const track: Track | undefined = this.tracks.at(trackNumber);

        if (!track) throw new TrackIndexError();

        this.tracks.splice(trackNumber, 1)
        return track;
    }

    async clearTracks(interaction: ChatInputCommandInteraction) : Promise<number> {
        await this.client.voiceService.ensureUserConnectedWithBigweld(interaction);
        const count: number = this.tracks.length;
        this.tracks = [];
        return count;
    }

    async skipTrack(interaction: ChatInputCommandInteraction) : Promise<{ skipped: Track, nowPlaying: Track | undefined }> {
        await this.client.voiceService.ensureUserConnectedWithBigweld(interaction);

        if (!this.nowPlaying) throw new NothingPlayingError();

        const skipped: Track = this.nowPlaying;
        this.nowPlaying = this.tracks.shift();
        return { skipped: skipped, nowPlaying: this.nowPlaying };
    }
}