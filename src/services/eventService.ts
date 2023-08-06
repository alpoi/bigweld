import DiscordClient from "../client";
import Event from "../events/event";

import ClientReady from "../events/ready";
import InteractionCreate from "../events/interactionCreate";


export default class EventService {
    public client: DiscordClient;

    constructor(client: DiscordClient) {
        this.client = client;
        this.register(ClientReady);
        this.register(InteractionCreate);
    }

    register(event: Event): void {
        if (event.once) {
            this.client.once(event.name, (...args: any) => event.execute(this.client)(...args));
        } else {
            this.client.on(event.name, (...args: any) => event.execute(this.client)(...args));
        }
    }
}