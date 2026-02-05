import { User } from "./user"

export interface AuthInfo {
  email: string,
  mdp: string
}

export interface LoginResponse {
  token: string,
  user: User
}
