import { AppException } from "../../../shared/exceptions/app.exception";
import { ErrorCodes } from "../../../shared/exceptions/error-codes";
import { hashPassword } from "../../../shared/utils/password";
import {
  toRegisteredUserDto,
  type RegisteredUserDto,
} from "../dtos/registered-user.dto";
import { UserRepository } from "../repositories/user.repository";
import type { RegisterBody } from "../validators/register.validator";

export class UserService {
  constructor(private readonly userRepository = new UserRepository()) {}

  async register(input: RegisterBody): Promise<RegisteredUserDto> {
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();

    const emailAlreadyExists = await this.userRepository.findByEmail(email);

    if (emailAlreadyExists) {
      throw new AppException(
        "Este e-mail já está cadastrado.",
        409,
        ErrorCodes.CONFLICT
      );
    }

    const hashedPassword = await hashPassword(input.password);

    const user = await this.userRepository.create({
      name,
      email,
      password: hashedPassword,
    });

    return toRegisteredUserDto(user);
  }
}
