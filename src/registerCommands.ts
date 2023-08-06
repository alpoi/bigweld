import { guildId } from "./config.json";
import DiscordClient from "./client";

const client: DiscordClient = new DiscordClient(guildId);

client.commands.registerCommands(guildId).catch(console.error);