import { Client, GatewayIntentBits } from "discord.js";
import { token } from "./config.json";
import CommandService from "./services/commandService";
import MusicService from "./services/musicService";
import EventService from "./services/eventService";

export default class DiscordClient extends Client {
    public readonly guildId: string;
    public commands: CommandService = new CommandService(this);
    public events: EventService = new EventService(this);
    public music: MusicService = new MusicService(this);

    constructor(guildId: string) {
        super({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates ] });
        this.guildId = guildId;
    }

    start() {
        this.login(token).catch(console.error);
    }
}