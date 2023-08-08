import { REST, Routes, Collection, RESTPostAPIApplicationCommandsJSONBody } from "discord.js";
import { clientId, token } from "../config.json";
import Command from "../models/command";
import BigweldClient from "../client";


export default class CommandService extends Collection<string, Command> {
    client: BigweldClient;

    constructor(client: BigweldClient) {
        super();
        this.client = client;
    }

    setCommands(commands: Command[]) : void {
        commands.forEach((cmd: Command) => this.set(cmd.name, cmd.bindToClient(this.client)));
    }

    async registerCommands(guildId: string) : Promise<void> {
        const commands: RESTPostAPIApplicationCommandsJSONBody[] = this.map((cmd: Command) => cmd.toJSON());
        const rest: REST = new REST().setToken(token);
        console.log(`Registering ${commands.length} slash commands for guild '${guildId}'`);
        return rest.put(Routes.applicationGuildCommands(clientId, guildId),{ body: commands })
            // @ts-ignore
            .then(data => { console.log(`Successfully registered ${data.length} slash commands`) })
            .catch(console.error);
    }
}