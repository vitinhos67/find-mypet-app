import type { User } from "../../users/models/user.model";

export type AuthenticatedUserDto = {
  id: string;
  name: string;
  email: string;
  registeredAt: string;
};

export function toAuthenticatedUserDto(user: User): AuthenticatedUserDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    registeredAt: user.created_at,
  };
}
