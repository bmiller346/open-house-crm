// 🔑 Auth feature types
export interface UserCredentials {
    email: string;
    password: string;
}

export interface AuthResult {
    token: string;
    userId: string;
}
