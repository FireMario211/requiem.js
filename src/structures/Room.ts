import { BanData }      from "src/typings/BanData";
import { InviteData }   from "src/typings/InviteData";
import { MessageData }  from "src/typings/MessageData";
import { RoomData }     from "src/typings/RoomData";
import { UserData }     from "src/typings/UserData";
import { Client }       from "./Client";
import axios            from 'axios';
export class Room implements RoomData {
    id: number;
    name: string;
    description: string;
    messages: MessageData[];
    members: UserData[];
    owner_id: number;
    created: string;
    bans: BanData[];
    invites: InviteData[];
    client: Client | null = null;
    constructor(client: Client, data: any) {
        this.client = client;
        for (const key in data) {
            // eslint-disable-next-line no-prototype-builtins
            if (data.hasOwnProperty(key)) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //@ts-ignores
                this[key] = data[key];
            }
        }
        return this;
    }
    sendMsg(content: string) {
        return new Promise((resolve) => {
            this.client = this.client as Client;
            this.client.emit("debug", `Sending message to room ${this.id}`);
            const messageData: MessageData = {
                id: 0,
                content,
                user: this.client.user,
                user_id: this.client.user.user_id,
                room_id: this.id,
                created: Date.now()
            };
            this.client.socket.emit('room', {
                roomID: this.id,
                user_id: this.client.user.user_id,
                key: this.client.getSessionKey()
            })
            this.client.socket.emit('user_message', {
                content,
                user_id: this.client.user.user_id,
                roomID: this.id,
                type: "room",
                key: this.client.getSessionKey()
            })
            return resolve(messageData);
        })
    }
}