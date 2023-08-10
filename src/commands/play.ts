import { ChatInputCommandInteraction, EmbedBuilder, GuildMember, SlashCommandBuilder, VoiceChannel } from "discord.js";
import {
    validate,
    playlist_info,
    soundcloud,
    spotify,
    video_info,
    YouTubeVideo,
    YouTubePlayList,
    SoundCloudPlaylist,
    SpotifyPlaylist,
    SpotifyAlbum,
    InfoData as YouTubeInfo,
    SoundCloudTrack as SoundCloudInfo,
    SpotifyTrack as SpotifyInfo, search,
} from "play-dl";
import BigweldClient from "../client";
import Command from "../models/command";
import Track, { SoundCloudTrack, SpotifyTrack, YouTubeTrack } from "../models/track";
import { QueryType } from "../models/query";


const handler = (client: BigweldClient) => async (interaction: ChatInputCommandInteraction) : Promise<void> => {
    await client.messageService.deferReply(interaction, false);
    const member: GuildMember = interaction.member as GuildMember;
    const channel: VoiceChannel | null = member.voice.channel as VoiceChannel | null;

    if (!client.voiceService.channelId && channel) {
        console.log("Not in a channel, but caller is - joining them");
        client.voiceService.textChannelId = interaction.channelId;
        await client.voiceService.join(channel);
    }

    if (!client.voiceService.memberConnectedWithBigweld(member)) {
        await client.messageService.bigweldCannotHearYou(interaction);
        return;
    }

    const queryString: string | null = interaction.options.getString('query');

    if (queryString === null) {
        await client.messageService.errorMessage(interaction);
        console.error("Query string was null");
        return;
    }

    const queryType: QueryType | false = await validate(queryString) as QueryType | false;

    let tracks: Track[];
    let response: EmbedBuilder | string;

    if (queryType == QueryType.SoundCloudPlaylist) {

        const playlist: SoundCloudPlaylist = await soundcloud(queryString) as SoundCloudPlaylist;
        tracks = (await playlist.all_tracks()).map((info: SoundCloudInfo) => new SoundCloudTrack(info, member, client, queryString));
        response = `Queued ${tracks.length} songs from a soundcloud playlist`; // TODO make embed

    } else if (queryType == QueryType.SoundCloudTrack) {

        const info: SoundCloudInfo = await soundcloud(queryString) as SoundCloudInfo;
        const track: SoundCloudTrack = new SoundCloudTrack(info, member, client);
        tracks = [ track ];
        response = await track.enqueuedEmbed(client.voiceService.tracks.length);

    } else if (queryType == QueryType.SpotifyPlaylist) {

        const playlist: SpotifyPlaylist = await spotify(queryString) as SpotifyPlaylist;
        tracks = await Promise.all(
            (await playlist.all_tracks()).map(
                async (info: SpotifyInfo): Promise<SpotifyTrack> => {
                    const youTubeVideo: YouTubeVideo | undefined = await SpotifyTrack.searchYouTube(info);
                    return new SpotifyTrack(info, member, client, queryString, youTubeVideo);
            })
        );
        response = `Queued ${tracks.length} songs from a spotify playlist`; // TODO make embed

    } else if (queryType == QueryType.SpotifyAlbum) {

        const album: SpotifyAlbum = await spotify(queryString) as SpotifyAlbum;
        tracks = await Promise.all(
            (await album.all_tracks()).map(
                async (info: SpotifyInfo): Promise<SpotifyTrack> => {
                    const youTubeVideo: YouTubeVideo | undefined = await SpotifyTrack.searchYouTube(info);
                    return new SpotifyTrack(info, member, client, queryString, youTubeVideo);
                })
        );
        response = `Queued ${tracks.length} songs from a spotify album`; // TODO make embed

    } else if (queryType == QueryType.SpotifyTrack) {

        const info: SpotifyInfo = await spotify(queryString) as SpotifyInfo;
        const youTubeVideo: YouTubeVideo | undefined = await SpotifyTrack.searchYouTube(info);
        const track: SpotifyTrack = new SpotifyTrack(info, member, client, queryString, youTubeVideo);
        tracks = [ track ];
        response = await track.enqueuedEmbed(client.voiceService.tracks.length);

    } else if (queryType == QueryType.YouTubePlaylist) {

        const playlist: YouTubePlayList = await playlist_info(queryString, { incomplete: true }) as YouTubePlayList;
        const videos: YouTubeVideo[] = await playlist.all_videos();
        tracks = (await Promise.all(videos.map(async (video: YouTubeVideo): Promise<YouTubeInfo> => video_info(video.url))))
            .map((info: YouTubeInfo) => new YouTubeTrack(info, member, client, queryString));
        response = `Queued ${tracks.length} songs from a youtube playlist`; // TODO make embed

    } else if (queryType == QueryType.YouTubeVideo) {

        const info: YouTubeInfo = await video_info(queryString) as YouTubeInfo;
        const track: YouTubeTrack = new YouTubeTrack(info, member, client, queryString);
        tracks = [ track ];
        response = await track.enqueuedEmbed(client.voiceService.tracks.length);

    } else if (queryType == QueryType.Search) {

        const videos: YouTubeVideo[] = await search(queryString, { source: { youtube: "video" }, limit: 1 });
        const video: YouTubeVideo | undefined = videos.pop();
        if (!video) {
            await client.messageService.rawReply(interaction, `Could not find track from "${queryString}"`, false);
            return;
        }
        const info: YouTubeInfo = await video_info(video.url);
        const track: YouTubeTrack = new YouTubeTrack(info, member, client, queryString);
        tracks = [ track ];
        response = await track.enqueuedEmbed(client.voiceService.tracks.length);

    } else {
        await client.messageService.errorMessage(interaction);
        return;
    }

    await client.voiceService.enqueue(tracks);

    if (!client.voiceService.nowPlaying) {
        await client.voiceService.skip();

    }

    if (response instanceof EmbedBuilder) {
        await client.messageService.embedReply(interaction, response);
    } else { // TODO phase this out when all embeds are built
        await client.messageService.rawReply(interaction, response, false);
    }
}

const builder: SlashCommandBuilder = new SlashCommandBuilder()
    .setName('play')
    .setDescription('Bigweld will attempt to find a song, then play it or add it to the queue')
    .addStringOption(option =>
        option.setName('query')
            .setDescription('A search term or audio url for YouTube, SoundCloud or Spotify')
            .setRequired(true)
    ) as SlashCommandBuilder;

export default new Command(builder, handler);
