import { SigninBodyDto } from './signin-body.dto';

export class AuthBodyDto extends SigninBodyDto {
  fullname?: string;
}
