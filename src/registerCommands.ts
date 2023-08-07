import { guildId } from "./config.json";
import DiscordClient from "./client";

import Join from "./commands/join";
import Ping from "./commands/ping";
import Leave from "./commands/leave";

const client: DiscordClient = new DiscordClient(guildId);

client.commandService.setCommands([
    Join,
    Ping,
    Leave
]);

client.commandService.registerCommands(guildId).catch(console.error);