import DiscordClient from "../client";

export default class MusicService {
    public client: DiscordClient

    constructor(client: DiscordClient) {
        this.client = client;
    }
}