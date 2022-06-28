import { RoomData } from "./RoomData";
export interface ClientData {
    user_id: number;
    username: string;
    nickname: string;
    icon: string;
    badges: Array<number>;
    createdIn: number;
    status: number;
    rooms: Array<RoomData>;
}