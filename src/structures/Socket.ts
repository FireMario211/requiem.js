import { io }           from 'socket.io-client';
import { Options }      from '../typings/ClientOptions';
export class Socket {
    public options: Options
    public socket: any;
    constructor(options: Options) {
        if (options) this.options = options;
        return this;
    }
    connect() {
        this.socket = io(this.options.URL, this.options.ws);
        return this;
    }
    on(event: string, callback: any) {
        this.socket.on(event, callback);
        return true;
    }
    emit(event: string, data: any) {
        this.socket.emit(event, data);
        return true;
    }
    disconnect() {
        this.socket.disconnect();
        return true;
    }
}