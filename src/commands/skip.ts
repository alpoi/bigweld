import BigweldClient from "../client";
import Track from "../models/track";
import Command from "../models/command";
import { ChatInputCommandInteraction, EmbedBuilder, GuildMember, SlashCommandBuilder } from "discord.js";

const handler = (client: BigweldClient) => async (interaction: ChatInputCommandInteraction) : Promise<void> => {
    await client.messageService.deferReply(interaction, false);
    const member: GuildMember = interaction.member as GuildMember;

    if (!client.voiceService.memberConnectedWithBigweld(member)) {
        await client.messageService.bigweldCannotHearYou(interaction);
        return;
    }

    const skipped: Track | undefined  = await client.voiceService.skip();

    if (skipped) {
        const skippedEmbed: EmbedBuilder = await skipped.skippedEmbed();
        await client.messageService.embedReply(interaction, skippedEmbed);
    } else {
        await client.messageService.rawReply(interaction, "There is nothing to skip", true);
    }
}

const builder: SlashCommandBuilder = new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Bigweld will skip the current track') as SlashCommandBuilder;

export default new Command(builder, handler);
