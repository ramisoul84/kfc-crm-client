import { Manager } from "./manager"

export interface AuthResponse {
    access_token: string
    manager: Manager
}