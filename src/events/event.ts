import { ClientEvents } from "discord.js";
import DiscordClient from "../client";



export default class Event {
    public name: keyof ClientEvents
    public once: boolean
    public execute: (client: DiscordClient) => Function

    constructor(name: keyof ClientEvents, once: boolean, execute: (client: DiscordClient) => Function) {
        this.name = name;
        this.once = once;
        this.execute = execute;
    }
}