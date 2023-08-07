import DiscordClient from "./client";
import { guildId } from "./config.json";

import Join from "./commands/join";
import Ping from "./commands/ping";
import Leave from "./commands/leave";

import ClientReady from "./events/clientReady";
import InteractionCreate from "./events/interactionCreate";

const client: DiscordClient = new DiscordClient(guildId);

client.commandService.setCommands([
    Join,
    Ping,
    Leave
]);

client.eventService.setEvents([
    ClientReady,
    InteractionCreate
])

client.start();

