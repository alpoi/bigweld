import { Events } from 'discord.js';
import DiscordClient from '../client';
import Event from './event';

export default new Event(
    Events.ClientReady,
    true,
    (client: DiscordClient) => () : void => {
        if (client.user === null) {
            console.error('Client user is null')
        } else {
            console.log(`Ready! Logged in as ${client.user.tag}`)
        }
    }
)