import BigweldClient from "./client";
import { discordGuildId } from "./config.json";

import Validate from "./commands/validate";
import Unpause from "./commands/unpause";
import Clear from "./commands/clear";
import List from "./commands/list";
import Pause from "./commands/pause";
import Play from "./commands/play";
import Skip from "./commands/skip";
import Join from "./commands/join";
import Ping from "./commands/ping";
import Leave from "./commands/leave";

import ClientReady from "./events/clientReady";
import InteractionCreate from "./events/interactionCreate";
import VoiceStateUpdate from "./events/voiceStateUpdate";

const client: BigweldClient = new BigweldClient(discordGuildId);


client.commandService.setCommands([
    Clear,
    Join,
    Leave,
    List,
    Pause,
    Ping,
    Play,
    Skip,
    Unpause,
    Validate,
]);

client.eventService.setEvents([
    ClientReady,
    InteractionCreate,
    VoiceStateUpdate
]);

client.start().catch(console.error);
