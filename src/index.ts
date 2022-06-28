/*declare var module: any;
(module).exports = {
    Client,
    Socket
};*/ // this is a hacky way that looks ugly but it works
import { Client } from './structures/Client';
import { Socket } from './structures/Socket';

export = {
    Client,
    Socket
}