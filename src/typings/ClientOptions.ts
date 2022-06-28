export interface Options {
    URL: string;
    ws: {
        reconnection: boolean,
        reconnectionDelay: number,
        reconnectionDelayMax: number,
        reconnectionAttempts: typeof Infinity
    },
    pingInterval: number;
    useToken: boolean;
}