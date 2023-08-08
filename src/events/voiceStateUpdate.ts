import { Events, GuildMember } from "discord.js";
import Event from "../models/event";
import BigweldClient from "../client";

const voiceStateUpdateHandler = (client: BigweldClient) => async (oldMember: GuildMember, newMember: GuildMember) : Promise<void> => {
    if (client.user && oldMember.id === client.user.id) {
        client.voiceService.channelId = newMember.voice.channelId ?? undefined;
    }
    // TODO handle being left alone in a channel
};

export default new Event(Events.VoiceStateUpdate, false, voiceStateUpdateHandler);
