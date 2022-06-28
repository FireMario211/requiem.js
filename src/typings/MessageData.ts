import { UserData } from "./UserData";

export interface MessageData {
    id: number;
    content: string;
    user_id: number;
    user: UserData;
    room_id: number;
    created: number;
}