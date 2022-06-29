import { RoomData }    from "src/typings/RoomData";
import { Client }      from "./Client";
import axios           from 'axios';
import { Room } from "./Room";
export class Rooms {
    public rooms: RoomData[] | any;
    client: Client;
    constructor(client: Client) {
        this.rooms = client.user.rooms as unknown;
        this.client = client;
        return this;
    }
    async getData(id: number) {
        try {
            const response = await axios({
                method: 'GET',
                url: `/api/rooms/${id}`
            });
            return response.data as RoomData;
        } catch(e) {
            return new Error(e as string);
        }
    }
    async get(id: number) {
        const findRoom = this.rooms.find((room: RoomData) => room.id == id);
        if (!findRoom) return false;
        const room = new Room(this.client, id);
        if (!room) return false;
        return room;
    }
    join(code: string) {
        return new Promise((resolve, reject) => {
            return axios({
                method: 'POST',
                url: `${this.client.options.URL}/api/rooms/join`,
                data: {
                    code
                },
                headers: {
                    Authorization: this.client.getSessionKey()
                }
            }).then(response => {
                if (response.data) {
                    this.rooms.push(response.data);
                    this.client.socket.emit('join_room', {
                        roomID: response.data.id,
                        user_id: this.client.user.user_id,
                        key: this.client.getSessionKey()
                    });
                    resolve(response.data);
                }
            }).catch(e => reject(e.response.data));
        });
    }
    create(name: string) {
        return new Promise((resolve, reject) => {
            return axios({
                method: 'POST',
                url: `${this.client.options.URL}/api/rooms/create`,
                data: {
                    name
                },
                headers: {
                    Authorization: this.client.getSessionKey()
                }
            }).then(response => {
                if (response.data) {
                    this.rooms.push(response.data);
                    resolve(response.data);
                }
            }).catch(e => reject(e.response.data));
        });
    }
    leave(id: number) {
        return new Promise((resolve, reject) => {
            return axios({
                method: 'POST',
                url: `${this.client.options.URL}/api/rooms/${id}/leave`,
                headers: {
                    Authorization: this.client.getSessionKey()
                }
            }).then(response => {
                if (response.data) {
                    this.rooms = this.rooms.filter((room: RoomData) => room.id != id);
                    this.client.socket.emit('leave_room', {
                        roomID: response.data.id,
                        user_id: this.client.user.user_id,
                        key: this.client.getSessionKey()
                    });
                    resolve(response.data);
                }
            }).catch(e => reject(e.response.data));
        });
    }
}