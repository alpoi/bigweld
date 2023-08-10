import { Events, VoiceState } from "discord.js";
import Event from "../models/event";
import BigweldClient from "../client";

const voiceStateUpdateHandler = (client: BigweldClient) => async (_oldVoiceState: VoiceState, newVoiceState: VoiceState) : Promise<void> => {
    if (client.user && (newVoiceState.id === client.user.id)) {
        client.voiceService.channelId = newVoiceState.channelId ?? undefined;
    }
};

export default new Event(Events.VoiceStateUpdate, false, voiceStateUpdateHandler);
