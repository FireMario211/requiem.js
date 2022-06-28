import EventEmitter     from 'events';
import { Socket }       from './Socket';
import axios            from 'axios';
import User             from './User';
import { Options }      from '../typings/ClientOptions';
import { ClientData }   from '../typings/ClientData';
import { Rooms } from './Rooms';
import { MessageData } from 'src/typings/MessageData';
import { RoomData } from 'src/typings/RoomData';
import { Room } from './Room';

export class Client extends EventEmitter {
    public options: Options = {
        URL: "http://localhost:3000",
        ws: {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: Infinity
        },
        pingInterval: 60000,
        useToken: false,
    }
    private auth: {
        username: string,
        password: string,
        tokens: {
            access: string,
            refresh: string
        }
    }
    public rooms: Rooms | null = null;
    public user: ClientData = {
        user_id: 0,
        username: "",
        nickname: "",
        icon: "",
        badges: [],
        createdIn: 0,
        status: 0,
        rooms: []
    };
    public socket: Socket;
    #pingInterval: any;
    constructor(username: string, password: string, options: Options) {
        super();
        this.auth = {
            username,
            password,
            tokens: {
                access: "",
                refresh: ""
            }
        };
        //this.options = {} as any;
        if (!username || !password) throw new Error("Username and password are required");
        if (options) {
            for (const key in options) {
                // eslint-disable-next-line no-prototype-builtins
                if (options.hasOwnProperty(key)) {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    this.options[key] = options[key];
                }
            }
            
        }
        this.auth.username = username;
        this.auth.password = password;
    }
    getSessionKey() {
        return this.auth.tokens.access;
    }
    async #listening() {
        this.rooms = this.rooms as Rooms
        const rooms = this.rooms;
        
        this.emit('debug', "Now listening for events...");
        this.socket.on('reconnect', () => {
            this.emit('reconnect')
            this.#join();
        });
        const getMessage = async (data: MessageData) => {
            const userData = rooms.rooms.find((room: RoomData) => room.id == data.room_id);
            if (userData) {
                data.user = userData;
                const room = await new Room(this, {
                    id: data.room_id
                });
                this.emit('msg', {room: room, send: (content: string) => {
                    return new Promise((resolve, reject) => room.sendMsg(content).then(resolve).catch(reject))
                }, ...data});
            }
        }
        this.socket.on('notification', (data: MessageData) => getMessage.bind(this)(data));
        this.socket.on('message', (data: MessageData) => getMessage.bind(this)(data));
    }
    async start() {
        const { username, password } = this.auth;
        this.options = this.options as Options
        try {
            this.emit('debug', "Connecting...");
            if (this.options.useToken) {
                this.emit('debug', 'Ignoring username and password, using token instead');
                this.auth = {
                    username: "",
                    password: "",
                    tokens: {
                        access: password,
                        refresh: username
                    }
                }
            } else {
                const response = await axios({
                    method: 'POST',
                    url: `${this.options.URL}/auth`,
                    data: {
                        username,
                        password
                    }
                })
                this.emit('debug', "Successfully logged in");
                this.auth = {
                    username,
                    password,
                    tokens: {
                        access: response.data.accessToken,
                        refresh: response.data.refreshToken,
                    }
                };
            }
            this.emit('debug', "Connecting to Socket...");
            this.socket = new Socket(this.options);
            this.socket.connect();
            this.emit('debug', "Connected to Socket");
            await this.#join();
            await this.ping();
            this.#listening();
            this.#pingInterval = setInterval(this.ping.bind(this), this.options.pingInterval);
            this.emit('ready');
        } catch (e) {
            this.emit('debug', e);
            return new Error(e as string);
        }
    }
    async #setUserData() {
        this.options = this.options as Options
        User.changeData(this.options.URL, this.auth.tokens.access);
        this.user = await User.get("self") as ClientData;
        this.rooms = new Rooms(this);
    }
    async #join() {
        await this.#setUserData();
        await this.socket.emit('join', {
            user_id: this.user.user_id,
            sessionKey: this.auth.tokens.access
        })
        await this.socket.emit('room', {
            roomID: 1,
            user_id: this.user.user_id,
            key: this.getSessionKey()
        })
    }
    async ping() {
        this.options = this.options as Options
        this.emit('debug', "Pinging...");
        try {
            const verify = await axios({
                url: `${this.options.URL}/verify`,
                method: "POST",
                headers: {
                    "authorization": this.auth.tokens.access
                },
                data: {
                    "refresh-token": this.auth.tokens.refresh
                },
            });
            if (verify.data != "OK" && verify.data.length > 5) {
                // Set new tokens
                this.auth.tokens.access = verify.data;
            }
        } catch (e: any) {
            if (e.response.status == 401) {
                this.emit('debug', "Refresh token expired, relogging in...");
                const res = await this.relogin();
                if (res instanceof Error) return;
                this.emit('debug', "Successfully relogged in");
                setTimeout(this.ping, 1000);
            } else {
                this.emit('debug', e);
                return new Error(e as string);
            }
        }
    }
    async relogin() {
        if (this.options.useToken) return new Error("Cannot relogin with token");
        this.options = this.options as Options
        const { username, password } = this.auth;
        try {
            const response = await axios({
                method: 'POST',
                url: `${this.options.URL}/auth`,
                data: {
                    username,
                    password
                }
            });
            this.auth.tokens.access = response.data.accessToken;
            this.auth.tokens.refresh = response.data.refreshToken;
            return true;
        } catch (e) {
            this.emit('debug', `Error: ${e}`);
            return new Error(e as string);
        }
    }
}