import { SlashCommandBuilder, RESTPostAPIApplicationCommandsJSONBody } from "discord.js";
import DiscordClient from "../client";

export default class Command {
    public name: string
    public description: string
    public _execute: (client: DiscordClient) => Function;
    public execute: Function = () : void => {};

    constructor(name: string, description: string, execute: (client: DiscordClient) => Function) {
        this.name = name;
        this.description = description;
        this._execute = execute;
    }

    public bindToClient(client: DiscordClient) {
        this.execute = this._execute(client);
        return this;
    }

    public toJSON(): RESTPostAPIApplicationCommandsJSONBody {
        const command: SlashCommandBuilder = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
        return command.toJSON();
    }
}