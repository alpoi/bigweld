import { Events, Interaction } from "discord.js";
import Event from "../models/event";
import Command from "../models/command";
import BigweldClient from "../client";

const interactionCreateHandler = (client: BigweldClient) => async (interaction: Interaction) : Promise<void> => {
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
        await client.messageService.unexpectedErrorReply(interaction);
    }
};

export default new Event(Events.InteractionCreate, false, interactionCreateHandler);
