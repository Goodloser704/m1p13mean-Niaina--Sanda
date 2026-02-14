import { User } from "./user.model"

export interface AuthInfo {
  email: string,
  mdp: string
}

export interface AuthResponse {
  token: string,
  user: User
}
