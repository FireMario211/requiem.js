import { UserData } from './UserData';
import { MessageData } from './MessageData';
import { BanData } from './BanData';
import { InviteData } from './InviteData';
export interface RoomData {
    /*id: Number,
    name: String,
    description: String,
    messages: Array,
    members: Array,
    owner_id: Number,
    created: Date,
    key: String*/

    id: number;
    name: string;
    description: string;
    messages: Array<MessageData>;
    members: Array<UserData>;
    owner_id: number;
    created: string;
    bans: Array<BanData>;
    invites: Array<InviteData>;
}