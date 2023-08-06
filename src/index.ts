import DiscordClient from "./client";
import { guildId } from "./config.json";

const client: DiscordClient = new DiscordClient(guildId);

client.start();

