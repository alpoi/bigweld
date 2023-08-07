import DiscordClient from "../client";
import Event from "../models/event";

export default class EventService {
    public client: DiscordClient;

    constructor(client: DiscordClient) {
        this.client = client;
    }

    setEvents(events: Event[]): void {
        events.forEach(
            (event: Event) => {
                if (event.once) {
                    this.client.once(event.name, (...args: any) => event.execute(this.client)(...args));
                } else {
                    this.client.on(event.name, (...args: any) => event.execute(this.client)(...args));
                }
            }
        )
    }
}