import { Client, GatewayIntentBits } from "discord.js";
import { is_expired, refreshToken, setToken } from "play-dl";
import {
    discordToken,
    spotifyClientId,
    spotifyClientSecret,
    spotifyMarket,
    spotifyRefreshToken,
    soundCloudClientId
} from "./config.json";
import CommandService from "./services/commandService";
import VoiceService from "./services/voiceService";
import EventService from "./services/eventService";
import MessageService from "./services/messageService";

export default class BigweldClient extends Client {
    public readonly guildId: string;
    public commandService: CommandService = new CommandService(this);
    public eventService: EventService = new EventService(this);
    public voiceService: VoiceService = new VoiceService(this);
    public messageService: MessageService = new MessageService(this);
    public avatarUrl?: string;

    constructor(guildId: string) {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildMessages
            ]
        });
        this.guildId = guildId;
    }

    async start() {
        await setToken({ soundcloud: { client_id: soundCloudClientId }});
        await setToken({
            spotify : {
                client_id: spotifyClientId,
                client_secret: spotifyClientSecret,
                market: spotifyMarket,
                refresh_token: spotifyRefreshToken
            }
        });
        if (is_expired()) await refreshToken();
        this.login(discordToken).catch(console.error).then(() : void => { this.avatarUrl = this.user!.displayAvatarURL() });
    }
}