import { Events, VoiceState } from "discord.js";
import Event from "../models/event";
import BigweldClient from "../client";

const voiceStateUpdateHandler = (client: BigweldClient) => async (_oldVoiceState: VoiceState, newVoiceState: VoiceState) : Promise<void> => {
    if (client.user && (newVoiceState.id === client.user.id)) {
        client.voiceService.channelId = newVoiceState.channelId ?? undefined;
        if (!client.voiceService.channelId) {
            await client.voiceService.leave();
            if (client.voiceService.textChannelId) await client.messageService.rawMessage(client.voiceService.textChannelId, "Sayonara o/");
        }
    }
};

export default new Event(Events.VoiceStateUpdate, false, voiceStateUpdateHandler);
