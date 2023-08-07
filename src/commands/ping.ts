import { ChatInputCommandInteraction } from "discord.js";
import Command from "../models/command";
import DiscordClient from "../client";

const pingHandler = (client: DiscordClient) => async (interaction: ChatInputCommandInteraction) : Promise<void> => {
    await client.messageService.deferReply(interaction);
    await client.messageService.pongMessage(interaction);
}

export default new Command(
    'ping',
    'Bigweld will hit the ball back',
    pingHandler
);