import BigweldClient from "./client";
import { guildId } from "./config.json";

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

const client: BigweldClient = new BigweldClient(guildId);


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

/* TODO
 *  - fix it so it doesn't skip everytime /play is invoked
 *  - fix it so it doesn't give the "bigweld can't hear you" error on /skip
 *  - fix the voiceStateUpdate event handler
 */