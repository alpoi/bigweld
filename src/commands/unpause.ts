import { ChatInputCommandInteraction, GuildMember, SlashCommandBuilder } from "discord.js";
import BigweldClient from "../client";
import Command from "../models/command";


const handler = (client: BigweldClient) => async (interaction: ChatInputCommandInteraction) : Promise<void> => {
    await client.messageService.deferReply(interaction, true);
    const member: GuildMember = interaction.member as GuildMember;

    if (!client.voiceService.memberConnectedWithBigweld(member)) {
        await client.messageService.bigweldCannotHearYou(interaction);
        return;
    }

    // TODO extract into embed builder
    if (!client.voiceService.nowPlaying) {
        await client.messageService.rawReply(interaction, "There is nothing to unpause", true);
    } else if (!client.voiceService.isPaused()) {
        await client.messageService.rawReply(interaction, "The music is not paused", true);
    } else {
        await client.voiceService.unpause();
        await client.messageService.rawReply(interaction, "The music has been unpaused", false);
    }
}

const builder: SlashCommandBuilder = new SlashCommandBuilder()
    .setName('unpause')
    .setDescription('Bigweld will unpause the music');

export default new Command(builder, handler);
