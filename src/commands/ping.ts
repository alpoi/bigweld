import { ChatInputCommandInteraction } from "discord.js";
import Command from "./command";
import DiscordClient from "../client";

// @ts-ignore
const execute = (client: DiscordClient) => async (interaction: ChatInputCommandInteraction) : Promise<void> => {
    await interaction.deferReply({ ephemeral: true });
    await interaction.followUp(`Pong!`);
}

export default new Command(
    'ping',
    'Bigweld will hit the ball back',
    execute
);