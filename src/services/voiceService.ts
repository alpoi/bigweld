import { GuildMember, VoiceChannel } from "discord.js";
import {
    VoiceConnection,
    joinVoiceChannel,
    AudioPlayer,
    AudioPlayerStatus,
    createAudioPlayer,
    NoSubscriberBehavior
} from "@discordjs/voice";

import Track from "../models/track";
import BigweldClient from "../client";

export default class VoiceService {
    public client: BigweldClient;
    public tracks: Track[] = [];
    public player: AudioPlayer = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Pause } });
    public playerState: AudioPlayerStatus = AudioPlayerStatus.Idle;
    public connection: VoiceConnection | undefined;
    public channelId: string | undefined;
    public nowPlaying: Track | undefined;

    constructor(client: BigweldClient) {
        this.client = client;
        this.player.on(AudioPlayerStatus.Paused,() => this.playerState = AudioPlayerStatus.Paused);
        this.player.on(AudioPlayerStatus.Buffering, () => this.playerState = AudioPlayerStatus.Buffering);
        this.player.on(AudioPlayerStatus.AutoPaused, () => this.playerState = AudioPlayerStatus.AutoPaused);
        this.player.on(AudioPlayerStatus.Playing, () => this.playerState = AudioPlayerStatus.Playing);
        this.player.on(AudioPlayerStatus.Idle,() => this.playerState = AudioPlayerStatus.Idle);
    }

    public async memberConnectedWithBigweld(member: GuildMember) : Promise<boolean> {
        return member.voice.channelId === this.channelId;
    }

    public async join(channel: VoiceChannel) : Promise<void> {
        this.channelId = channel.id;
        this.connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: this.client.guildId,
            adapterCreator: channel.guild.voiceAdapterCreator
        });

        this.connection.subscribe(this.player);
    }

    public async leave() : Promise<void> {
        this.connection?.destroy();
        this.connection = undefined;
        this.channelId = undefined;
        this.nowPlaying = undefined;
        this.tracks = [];
        this.player.stop();
    }

    public async pause() : Promise<boolean> {
        return this.player.pause(true);
    }

    public async resume() : Promise<boolean> {
        return this.player.unpause();
    }

    public async enqueue(tracks: Track[]) : Promise<Track | undefined> {
        this.tracks.concat(tracks);
        if (!this.nowPlaying) {
            await this.skip();
        }
        return this.nowPlaying;
    }

    public async dequeue(trackNumber: number) : Promise<Track | undefined> {
        const track: Track | undefined = this.tracks.at(trackNumber);
        if (track) this.tracks.splice(trackNumber, 1);
        return track;
    }

    public async clear() : Promise<number> {
        const count: number = this.tracks.length;
        this.tracks = [];
        return count;
    }

    public async skip() : Promise<Track | undefined> {
        const skipped: Track | undefined = this.nowPlaying;
        this.nowPlaying = this.tracks.shift();
        if (this.nowPlaying) {
            this.player.play(await this.nowPlaying.toResource());
        }
        return skipped;
    }
}