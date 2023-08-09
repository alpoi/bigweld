export const QueryType = {
    SoundCloudPlaylist: "so_playlist",
    SoundCloudTrack: "so_track",
    SpotifyPlaylist: "sp_playlist",
    SpotifyAlbum: "sp_album",
    SpotifyTrack: "sp_track",
    YouTubePlaylist: "yt_playlist",
    YouTubeVideo: "yt_video",
    Search: "search"
}


export type QueryType = typeof QueryType[keyof typeof QueryType];
