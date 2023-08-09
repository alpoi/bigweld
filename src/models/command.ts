import { SlashCommandBuilder, RESTPostAPIApplicationCommandsJSONBody } from "discord.js";
import BigweldClient from "../client";

export default class Command {
    public builder: SlashCommandBuilder;

    public execute: Function = () : void => {};
    public _execute: (client: BigweldClient) => Function;

    constructor(builder: SlashCommandBuilder, execute: (client: BigweldClient) => Function) {
        this.builder = builder;
        this._execute = execute;
    }

    public bindToClient(client: BigweldClient) {
        this.execute = this._execute(client);
        return this;
    }

    public toJSON(): RESTPostAPIApplicationCommandsJSONBody {
        return this.builder.toJSON();
    }
}