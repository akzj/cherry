import { UserStatus } from "./user";

export interface LoginResponse {
    user_id: string;
    username: string;
    email: string;
    avatar_url: string;
    status: UserStatus;
    jwt_token: string;
  }