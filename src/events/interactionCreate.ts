import { Events, Interaction } from "discord.js";
import Event from "../models/event";
import Command from "../models/command";
import DiscordClient from "../client";

const execute = (client: DiscordClient) => async (interaction: Interaction) : Promise<void> => {
    if (!interaction.isChatInputCommand()) {
        return;
    }

    const command: Command | undefined = client.commandService.get(interaction.commandName);

    if (command === undefined) {
        console.error(`No command matching ${interaction.commandName} was found.`)
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
};

export default new Event(
    Events.InteractionCreate,
    false,
    execute
);