import { UserData } from "./UserData";

export interface BanData {
    banned_by: number;
    reason: string;
    room_id: number;
    user: UserData;
    user_id: number;
}