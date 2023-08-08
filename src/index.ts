import BigweldClient from "./client";
import { guildId } from "./config.json";

import Join from "./commands/join";
import Ping from "./commands/ping";
import Leave from "./commands/leave";

import ClientReady from "./events/clientReady";
import InteractionCreate from "./events/interactionCreate";
import VoiceStateUpdate from "./events/voiceStateUpdate";

const client: BigweldClient = new BigweldClient(guildId);  // TODO refactor to allow multiple guilds

client.commandService.setCommands([
    Join,
    Ping,
    Leave
]);

client.eventService.setEvents([
    ClientReady,
    InteractionCreate,
    VoiceStateUpdate
])

client.start();

