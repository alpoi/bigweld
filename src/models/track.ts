import { AudioResource, createAudioResource } from "@discordjs/voice";
import {
    stream,
    stream_from_info,
    InfoData as YouTubeInfo,
    SoundCloudTrack as SoundCloudInfo,
    SpotifyTrack as SpotifyInfo,
    YouTubeStream,
    SoundCloudStream, YouTubeVideo, search
} from "play-dl";
import { APIEmbedField } from "discord-api-types/v10";
import { ColorResolvable, Colors, EmbedBuilder, GuildMember } from "discord.js";
import formatSeconds from "../helpers/duration";
import BigweldClient from "../client";


type TrackInfo = SpotifyInfo | YouTubeInfo | SoundCloudInfo;


export class PlaybackError extends Error {
    info: TrackInfo;

    constructor(info: TrackInfo, message: string) {
        super(message);
        this.info = info;
    }
}


export default abstract class Track {
    abstract resource() : Promise<AudioResource>;
    abstract detailedEmbed(action: string, color: ColorResolvable, position?: number) : Promise<EmbedBuilder>;
    abstract shortEmbed(action: string, color: ColorResolvable) : Promise<EmbedBuilder>;
    abstract info: any;

    protected constructor(public requester: GuildMember, public client: BigweldClient, public originalQuery?: string) {}

    public async enqueuedEmbed(position: number) : Promise<EmbedBuilder> {
        return this.detailedEmbed("Added to queue", Colors.Blurple, position);
    }

    public async playingEmbed() : Promise<EmbedBuilder> {
        return this.detailedEmbed("Playing", Colors.Green);
    }

    public async dequeuedEmbed() : Promise<EmbedBuilder> {
        return this.shortEmbed("Removed", Colors.Greyple);
    }

    public async skippedEmbed() : Promise<EmbedBuilder> {
        return this.shortEmbed("Skipped", Colors.Grey);
    }
}

export class YouTubeTrack extends Track {
    public info: YouTubeInfo;

    constructor(info: YouTubeInfo, requester: GuildMember, client: BigweldClient, originalQuery?: string) {
        super(requester, client, originalQuery)
        this.info = info;
    }

    public async resource() : Promise<AudioResource> {
        try {
            const stream: YouTubeStream = await stream_from_info(this.info);
            return createAudioResource(stream.stream, { inputType: stream.type });
        } catch (error) {
            console.error(error);
            throw new PlaybackError(this.info, error.message);
        }
    }

    public async detailedEmbed(action: string, color: ColorResolvable, position?: number) : Promise<EmbedBuilder> {
        const videoDetails: YouTubeVideo = this.info.video_details;
        const fields: APIEmbedField[] = [
            {
                name: "Channel",
                value: `[${videoDetails.channel?.name}](${videoDetails.channel?.url})`,
                inline: true
            },
            {
                name: "Duration",
                value: formatSeconds(videoDetails.durationInSec),
                inline: true
            }
        ];

        if (position) fields.push({ name: "Position", value: `${position}`, inline: true });
        if (this.originalQuery) fields.push({ name: "Query", value: this.originalQuery });

        return new EmbedBuilder()
            .setAuthor({ name: action, iconURL: this.client.avatarUrl })
            .setColor(color)
            .setTitle(this.info.video_details.title ?? this.info.video_details.url)
            .setURL(this.info.video_details.url)
            .setFooter({ text: this.requester.user.tag, iconURL: this.requester.user.displayAvatarURL() })
            .setTimestamp()
            .setThumbnail(this.info.video_details.thumbnails.shift()?.url ?? null)
            .addFields(...fields);
    }

    public async shortEmbed(action: string, color: ColorResolvable) : Promise<EmbedBuilder> {
        const videoDetails: YouTubeVideo = this.info.video_details;

        return new EmbedBuilder()
            .setDescription(`${action}: [${this.info.video_details.title ?? this.info.video_details.url}](${videoDetails.url})`)
            .setColor(color)
            .setFooter({ text: this.requester.user.tag, iconURL: this.requester.user.displayAvatarURL() })
            .setTimestamp();

    }
}

export class SoundCloudTrack extends Track {
    public info: SoundCloudInfo

    constructor(info: SoundCloudInfo, requester: GuildMember, client: BigweldClient, originalQuery?: string) {
        super(requester, client, originalQuery);
        this.info = info
    }

    public async resource() : Promise<AudioResource> {
        try {
            const stream: SoundCloudStream = await stream_from_info(this.info);
            return createAudioResource(stream.stream, { inputType: stream.type });
        } catch (error) {
            console.error(error);
            throw new PlaybackError(this.info, error.message);
        }
    }

    public async detailedEmbed(action: string, color: ColorResolvable, position?: number) : Promise<EmbedBuilder> {
        const fields: APIEmbedField[] = [
            {
                name: "Artist",
                value: `[${this.info.user.name}](${this.info.user.url})`,
                inline: true
            },
            {
                name: "Duration",
                value: formatSeconds(this.info.durationInSec),
                inline: true
            }
        ];

        if (position) fields.push({ name: "Position", value: `${position}`, inline: true });
        if (this.originalQuery) fields.push({ name: "Query", value: this.originalQuery });

        return new EmbedBuilder()
            .setAuthor({ name: action, iconURL: this.client.avatarUrl })
            .setColor(color)
            .setTitle(this.info.name)
            .setURL(this.info.url)
            .setFooter({ text: this.requester.user.tag, iconURL: this.requester.user.displayAvatarURL() })
            .setTimestamp()
            .setThumbnail(this.info.thumbnail)
            .addFields(...fields);
    }

    public async shortEmbed(action: string, color: ColorResolvable) : Promise<EmbedBuilder> {
        return new EmbedBuilder()
            .setDescription(`${action}: [${this.info.name}](${this.info.url})`)
            .setColor(color)
            .setFooter({ text: this.requester.user.tag, iconURL: this.requester.user.displayAvatarURL() })
            .setTimestamp();

    }
}

export class SpotifyTrack extends Track {
    public info: SpotifyInfo;
    public youTubeVideo?: YouTubeVideo

    constructor(info: SpotifyInfo, requester: GuildMember, client: BigweldClient, originalQuery?: string, youTubeVideo?: YouTubeVideo) {
        super(requester, client, originalQuery);
        this.info = info;
        this.youTubeVideo = youTubeVideo;
    }

    public static async searchYouTube(info: SpotifyInfo) : Promise<YouTubeVideo | undefined> {
        let searchString: string = `${info.name}`;
        const firstArtist = info.artists[0];
        if (firstArtist) searchString += ` ${firstArtist.name}`;
        const searched: YouTubeVideo[] = await search(searchString, {limit: 1});
        return searched[0];
    }

    public async resource(): Promise<AudioResource> {
        if (!this.youTubeVideo) throw new PlaybackError(this.info, "Could not find YouTube equivalent for Spotify track");
        try {
            const youtubeStream: YouTubeStream = await stream(this.youTubeVideo.url) as YouTubeStream;
            return createAudioResource(youtubeStream.stream, {inputType: youtubeStream.type})
        } catch (error) {
            console.error(error);
            throw new PlaybackError(this.info, error.message);
        }
    }

    public async detailedEmbed(action: string, color: ColorResolvable, position?: number): Promise<EmbedBuilder> {
        const fields: APIEmbedField[] = [
            {
                name: "Artist",
                value: this.info.artists.map(artist => `[${artist.name}](${artist.url})`).join(", "),
                inline: true
            },
            {
                name: "Duration",
                value: formatSeconds(this.info.durationInSec),
                inline: true
            }
        ];

        if (position) fields.push({name: "Position", value: `${position}`, inline: true});
        if (this.originalQuery) fields.push({ name: "Query", value: this.originalQuery });

        const resolvedVideoText: string = `[${this.youTubeVideo?.title}](${this.youTubeVideo?.url})`
            .replace("_", "\\_");

        return new EmbedBuilder()
            .setAuthor({name: action, iconURL: this.client.avatarUrl})
            .setColor(color)
            .setTitle(this.info.name)
            .setURL(this.info.url)
            .setFooter({text: this.requester.user.tag, iconURL: this.requester.user.displayAvatarURL()})
            .setTimestamp()
            .setThumbnail(this.info.thumbnail?.url ?? null)
            .addFields(...fields)
            .setDescription(`_Resolved to YouTube video:\n${resolvedVideoText}_`)
    }

    public async shortEmbed(action: string, color: ColorResolvable): Promise<EmbedBuilder> {
        return new EmbedBuilder()
            .setDescription(`${action}: [${this.info.name}](${this.info.url})`)
            .setColor(color)
            .setFooter({text: this.requester.user.tag, iconURL: this.requester.user.displayAvatarURL()})
            .setTimestamp();
    }
}