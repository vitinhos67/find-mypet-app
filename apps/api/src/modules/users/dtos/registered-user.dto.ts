import type { User } from "../models/user.model";

export type RegisteredUserDto = {
  id: string;
  name: string;
  email: string;
  registeredAt: string;
};

export function toRegisteredUserDto(user: User): RegisteredUserDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    registeredAt: user.created_at,
  };
}
