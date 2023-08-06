import { REST, Routes, Collection, RESTPostAPIApplicationCommandsJSONBody } from "discord.js";
import { clientId, token } from "../config.json";
import Command from "../commands/command";
import DiscordClient from "../client";

import Ping from "../commands/ping";
import User from "../commands/user";
import Join from "../commands/join";
import Leave from "../commands/leave";

export default class CommandService extends Collection<string, Command> {
    client: DiscordClient;

    constructor(client: DiscordClient) {
        super();
        this.client = client;
        this.setCommands();
    }

    setCommands(): void {
        this.set('ping', Ping.bindToClient(this.client));
        this.set('user', User.bindToClient(this.client));
        this.set('join', Join.bindToClient(this.client));
        this.set('leave', Leave.bindToClient(this.client));
    }

    async registerCommands(guildId: string) {
        const commands: RESTPostAPIApplicationCommandsJSONBody[] = this.map((cmd: Command) => cmd.toJSON());
        const rest: REST = new REST().setToken(token);
        console.log(`Registering ${commands.length} slash commands for guild '${guildId}'`);
        return rest.put(Routes.applicationGuildCommands(clientId, guildId),{ body: commands })
            // @ts-ignore
            .then(data => { console.log(`Successfully registered ${data.length} slash commands`) })
            .catch(console.error);
    }
}