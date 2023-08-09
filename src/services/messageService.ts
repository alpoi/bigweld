import {Channel, ChatInputCommandInteraction, EmbedBuilder, InteractionReplyOptions} from "discord.js";
import BigweldClient from "../client";
// import Track from "../models/track";

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
    };

    public async rawReply(interaction: ChatInputCommandInteraction, content: string, ephemeral: boolean = false) : Promise<void> {
        await this.interactionReply(interaction, { content, ephemeral });
    }

    public async embedReply(interaction: ChatInputCommandInteraction, embed: EmbedBuilder, ephemeral: boolean = false) : Promise<void> {
        await this.interactionReply(interaction, { embeds: [embed], ephemeral });
    }

    public async embedMessage(channelId: string, embed: EmbedBuilder) : Promise<void> {
        const channel: Channel | null = await this.client.channels.fetch(channelId);
        if (channel && channel.isTextBased()) await channel.send({ embeds: [embed] });
    }

    public async deferReply(interaction: ChatInputCommandInteraction, ephemeral: boolean = false) : Promise<void> {
        await interaction.deferReply({ ephemeral })
    }

    public async bigweldCannotHearYou(interaction: ChatInputCommandInteraction) : Promise<void> {
        await this.rawReply(interaction, "Bigweld cannot hear you unless you are in a channel together", true);
    }

    public async errorMessage(interaction: ChatInputCommandInteraction) : Promise<void> {
        await this.interactionReply(interaction,
            { content: 'There was an error while executing this command!', ephemeral: true}
        );
    }
}