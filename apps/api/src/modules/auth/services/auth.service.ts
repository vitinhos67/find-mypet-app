import { getSessionExpiresAt } from "../../../shared/config/session-cookie.config";
import { AppException } from "../../../shared/exceptions/app.exception";
import { ErrorCodes } from "../../../shared/exceptions/error-codes";
import { comparePassword } from "../../../shared/utils/password";
import { UserRepository } from "../../users/repositories/user.repository";
import {
  toAuthenticatedUserDto,
  type AuthenticatedUserDto,
} from "../dtos/authenticated-user.dto";
import { SessionRepository } from "../repositories/session.repository";
import type { LoginBody } from "../validators/login.validator";

export class AuthService {
  constructor(
    private readonly userRepository = new UserRepository(),
    private readonly sessionRepository = new SessionRepository()
  ) {}

  async login(input: LoginBody): Promise<{
    user: AuthenticatedUserDto;
    sessionId: string;
  }> {
    const email = input.email.trim().toLowerCase();
    const user = await this.userRepository.findByEmailWithPassword(email);

    if (!user || !(await comparePassword(input.password, user.password))) {
      throw new AppException(
        "E-mail ou senha inválidos.",
        401,
        ErrorCodes.UNAUTHORIZED
      );
    }

    const sessionId = await this.sessionRepository.create(
      user.id,
      getSessionExpiresAt()
    );

    return {
      user: toAuthenticatedUserDto(user),
      sessionId,
    };
  }

  async getAuthenticatedUser(userId: string): Promise<AuthenticatedUserDto> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AppException(
        "Usuário não encontrado.",
        401,
        ErrorCodes.UNAUTHORIZED
      );
    }

    return toAuthenticatedUserDto(user);
  }

  async logout(sessionId: string): Promise<void> {
    await this.sessionRepository.delete(sessionId);
  }
}
