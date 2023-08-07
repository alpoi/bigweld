import { Events } from 'discord.js';
import DiscordClient from '../client';
import Event from '../models/event';

const execute = (client: DiscordClient) => () : void => {
    if (client.user === null) {
        console.error('Client user is null')
    } else {
        console.log(`Logged in as ${client.user.tag}`)
    }
};

export default new Event(
    Events.ClientReady,
    true,
    execute
);