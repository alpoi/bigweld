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

async function death(signal: string) : Promise<void> {
    console.log(`Received ${signal} signal - tidying up`)
    try { client.voiceService.leave() } catch (error) { console.error(error) }
    try {
        if (client.voiceService.textChannelId) {
            await client.messageService.errorEmbedMessage(
                client.voiceService.textChannelId,
                `Bigweld received a ${signal} signal and promptly vanished`
            );
        }
    } catch (error) {
        console.error(error)
    }
    try { await client.destroy() } catch (error) { console.error(error) }
}

process.on('SIGINT', () => death('SIGINT'));
process.on('SIGTERM', () => death('SIGTERM'));
process.on('SIGKILL', () => death('SIGKILL'));