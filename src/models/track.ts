import {AudioResource, createAudioResource} from "@discordjs/voice";

export default class Track {
    public async toResource(): Promise<AudioResource> {
        // TODO implement
        return createAudioResource("");
    }
}