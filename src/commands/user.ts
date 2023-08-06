import { ChatInputCommandInteraction, GuildMember } from "discord.js";
import Command from "./command";
import DiscordClient from "../client";
import { interactionError } from "../helpers/error";

// @ts-ignore
const execute = (client: DiscordClient) => async (interaction: ChatInputCommandInteraction) : Promise<void> => {
    await interaction.deferReply({ ephemeral: true });
    const member: GuildMember = interaction.member as GuildMember;

    if (member === null) {
        await interactionError(interaction,"Expected interaction.member to be non-null", { interaction })
        return;
    }

    await interaction.followUp(`This command was run by ${interaction.user.username}, who joined on ${member.joinedAt}`);
}

export default new Command(
    'user',
    'Describes the user',
    execute
)