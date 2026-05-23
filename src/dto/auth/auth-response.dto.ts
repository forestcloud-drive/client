import { UserPayloadDto } from '../user-payload.dto';

export class SigninResponseDto {
  declare auth_token: string;
  declare user: UserPayloadDto;
  declare message?: string;
  declare temporaryPasswordUsed?: boolean;
}
