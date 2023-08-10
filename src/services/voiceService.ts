import { GuildMember, VoiceChannel } from "discord.js";
import { is_expired, refreshToken } from "play-dl";
import {
    joinVoiceChannel,
    createAudioPlayer,
    entersState,
    VoiceConnection,
    VoiceConnectionStatus,
    AudioPlayer,
    AudioPlayerStatus,
    AudioPlayerError,
    NoSubscriberBehavior
} from "@discordjs/voice";
import BigweldClient from "../client";
import Track from "../models/track";


export default class VoiceService {
    public client: BigweldClient;
    public tracks: Track[] = [];
    public player: AudioPlayer;
    public playerState: AudioPlayerStatus = AudioPlayerStatus.Idle;
    public connection?: VoiceConnection;
    public channelId?: string;
    public textChannelId?: string;
    public nowPlaying?: Track;

    constructor(client: BigweldClient) {
        this.client = client;
        this.player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Pause } });
        this.setAudioPlayerListeners();
    }

    public memberConnectedWithBigweld(member: GuildMember) : boolean {
        return member.voice.channelId !== null && member.voice.channelId === this.channelId;
    }

    public isPaused() : boolean {
        return this.playerState === AudioPlayerStatus.Paused || this.playerState === AudioPlayerStatus.AutoPaused;
    }

    public setAudioPlayerListeners() : void {
        this.player?.on(AudioPlayerStatus.Paused,() => this.playerState = AudioPlayerStatus.Paused);
        this.player?.on(AudioPlayerStatus.Buffering, () => this.playerState = AudioPlayerStatus.Buffering);
        this.player?.on(AudioPlayerStatus.AutoPaused, () => this.playerState = AudioPlayerStatus.AutoPaused);
        this.player?.on(AudioPlayerStatus.Playing, () => this.playerState = AudioPlayerStatus.Playing);
        this.player?.on(AudioPlayerStatus.Idle,async () : Promise<void> => {
            this.playerState = AudioPlayerStatus.Idle;
            if (is_expired()) await refreshToken();
            await this.skip();
        });
        this.player?.on("error", (error: AudioPlayerError) => console.error(error));
    }

    public setVoiceConnectionListeners() : void {
        this.connection?.on(VoiceConnectionStatus.Disconnected, async () => {
            await Promise.race([
                entersState(this.connection!, VoiceConnectionStatus.Signalling, 5_000),
                entersState(this.connection!, VoiceConnectionStatus.Connecting, 5_000)
            ]).catch((error): void => {
                console.error(error);
                this.connection?.destroy();
            })
        })
    }

    public async join(channel: VoiceChannel) : Promise<void> {
        if (this.channelId && this.connection) {
            this.connection.destroy();
            this.connection = undefined;
        }

        this.channelId = channel.id;
        this.connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: this.client.guildId,
            adapterCreator: channel.guild.voiceAdapterCreator
        });
        this.setVoiceConnectionListeners();

        if (!this.player) {
            this.player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Pause } });
            this.setAudioPlayerListeners();
        }

        this.connection.subscribe(this.player);
        await this.skip();
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

    public async unpause() : Promise<boolean> {
        return this.player.unpause();
    }

    public async enqueue(tracks: Track[]) : Promise<Track | undefined> {
        this.tracks = this.tracks.concat(tracks);
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
            this.player.play(await this.nowPlaying.resource());
            await this.client.messageService.embedMessage(this.textChannelId!, await this.nowPlaying.playingEmbed());
        }
        return skipped;
    }
}