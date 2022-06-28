import axios from 'axios';
import { UserData } from '../typings/UserData';
let URI = "";
let sessionKey = "";
const User = {
    changeData: (uri: string, access: string) => {
        URI = uri;
        sessionKey = access;
    },
    get: async (user_id: string | number) => {
        try {
            const response = await axios({
                method: 'GET',
                url: `${URI}/api/users/${user_id}`,
                headers: {
                    Authorization: sessionKey
                }
            })
            return response.data as UserData;
        } catch(e) {
            return new Error(e as string);
        }
    }
}
export = User;