import BigweldClient from "../client";
import {ChatInputCommandInteraction, GuildMember, SlashCommandBuilder} from "discord.js";
import Command from "../models/command";

const handler = (client: BigweldClient) => async (interaction: ChatInputCommandInteraction) : Promise<void> => {
    await client.messageService.deferReply(interaction, false);
    const member: GuildMember = interaction.member as GuildMember;

    if (!client.voiceService.memberConnectedWithBigweld(member)) {
        await client.messageService.bigweldCannotHearYou(interaction);
        return;
    }

    const tracksCleared: number = await client.voiceService.clear();
    await client.messageService.rawReply(interaction, `Cleared ${tracksCleared} tracks`, false);
}

const builder: SlashCommandBuilder = new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Bigweld will clear the queue - this does not skip the current track');

export default new Command(builder, handler);
