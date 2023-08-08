import { Events } from 'discord.js';
import BigweldClient from '../client';
import Event from '../models/event';

const clientReadyHandler = (client: BigweldClient) => () : void => {
    if (client.user === null) {
        console.error('Client user is null')
    } else {
        console.log(`Logged in as ${client.user.tag}`)
    }
};

export default new Event(Events.ClientReady,true, clientReadyHandler);