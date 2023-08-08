import { ClientEvents } from "discord.js";
import BigweldClient from "../client";

export default class Event {
    public name: keyof ClientEvents
    public once: boolean
    public execute: (client: BigweldClient) => Function

    constructor(name: keyof ClientEvents, once: boolean, execute: (client: BigweldClient) => Function) {
        this.name = name;
        this.once = once;
        this.execute = execute;
    }
}