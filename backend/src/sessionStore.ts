interface SessionData {
    userId: number;
    role: string;
    email: string;
}

const sessionStore = new Map<string, SessionData>();

export default sessionStore;