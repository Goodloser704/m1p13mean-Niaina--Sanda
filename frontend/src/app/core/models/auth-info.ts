import { User } from "./user"

export interface AuthInfo {
  email: string,
  mdp: string
}

export interface AuthResponse {
  token: string,
  user: User
}
