import { Client, GatewayIntentBits } from "discord.js";
import { token } from "./config.json";
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

    constructor(guildId: string) {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildVoiceStates
            ]
        });
        this.guildId = guildId;
    }

    start() {
        this.login(token).catch(console.error);
    }
}