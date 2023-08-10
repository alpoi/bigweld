import { discordGuildId } from "./config.json";
import BigweldClient from "./client";

import Join from "./commands/join";
import Ping from "./commands/ping";
import Leave from "./commands/leave";
import Validate from "./commands/validate";
import Clear from "./commands/clear";
import List from "./commands/list";
import Pause from "./commands/pause";
import Play from "./commands/play";
import Unpause from "./commands/unpause";
import Skip from "./commands/skip";

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

client.commandService.registerCommands(discordGuildId).catch(console.error);