import { Channel, ChatInputCommandInteraction, Colors, EmbedBuilder, InteractionReplyOptions } from "discord.js";
import { bigweldJoinGif, bigweldLeaveGif } from "../config.json";
import BigweldClient from "../client";

export default class MessageService {
    public client: BigweldClient;

    constructor(client: BigweldClient) {
        this.client = client;
    }

    private async interactionReply(interaction: ChatInputCommandInteraction, options: InteractionReplyOptions) : Promise<void> {
        if (interaction.deferred || interaction.replied) {
            await interaction.followUp(options);
        } else {
            await interaction.reply(options);
        }
    }

    public async rawReply(interaction: ChatInputCommandInteraction, content: string, ephemeral: boolean = false) : Promise<void> {
        await this.interactionReply(interaction, { content, ephemeral });
    }

    public async embedReply(interaction: ChatInputCommandInteraction, embed: EmbedBuilder, ephemeral: boolean = false) : Promise<void> {
        await this.interactionReply(interaction, { embeds: [embed], ephemeral });
    }

    public async joinReply(interaction: ChatInputCommandInteraction) : Promise<void> {
        if (bigweldJoinGif) {
            await this.rawReply(interaction, bigweldJoinGif);
        } else {
            const embed: EmbedBuilder = new EmbedBuilder()
                .setColor(Colors.Gold)
                .setDescription("Bigweld has arrived");
            await this.interactionReply(interaction, { embeds: [embed] });
        }
    }

    public async leaveReply(interaction: ChatInputCommandInteraction) : Promise<void> {
        if (bigweldLeaveGif) {
            await this.rawReply(interaction, bigweldLeaveGif);
        } else {
            const embed: EmbedBuilder = new EmbedBuilder()
                .setColor(Colors.Gold)
                .setDescription("Bigweld has vanished");
            await this.interactionReply(interaction, { embeds: [embed] });
        }
    }

    public async errorEmbedReply(interaction: ChatInputCommandInteraction, text: string, ephemeral: boolean = false) : Promise<void> {
        const embed: EmbedBuilder = new EmbedBuilder()
            .setColor(Colors.Red)
            .setDescription(text);
        await this.interactionReply(interaction, { embeds: [embed], ephemeral });
    }

    public async neutralEmbedReply(interaction: ChatInputCommandInteraction, text: string, ephemeral: boolean = false) : Promise<void> {
        const embed: EmbedBuilder = new EmbedBuilder()
            .setColor(Colors.Blurple)
            .setDescription(text);
        await this.interactionReply(interaction, { embeds: [embed], ephemeral });
    }

    public async successEmbedReply(interaction: ChatInputCommandInteraction, text: string, ephemeral: boolean = false) : Promise<void> {
        const embed: EmbedBuilder = new EmbedBuilder()
            .setColor(Colors.Green)
            .setDescription(text);
        await this.interactionReply(interaction, { embeds: [embed], ephemeral });
    }

    public async embedMessage(channelId: string, embed: EmbedBuilder) : Promise<void> {
        const channel: Channel | null = await this.client.channels.fetch(channelId);
        if (channel && channel.isTextBased()) await channel.send({ embeds: [embed] });
    }

    public async errorEmbedMessage(channelId: string, text: string) : Promise<void> {
        const embed: EmbedBuilder = new EmbedBuilder()
            .setColor(Colors.Red)
            .setDescription(text);
        await this.embedMessage(channelId, embed);
    }

    public async deferReply(interaction: ChatInputCommandInteraction, ephemeral: boolean = false) : Promise<void> {
        await interaction.deferReply({ ephemeral })
    }

    public async bigweldCannotHearYou(interaction: ChatInputCommandInteraction) : Promise<void> {
        await this.errorEmbedReply(interaction, "Bigweld cannot hear you unless you are in a channel together");
    }

    public async unexpectedErrorReply(interaction: ChatInputCommandInteraction) : Promise<void> {
        await this.errorEmbedReply(interaction, "There was an error while executing this command!", true);
    }
}
