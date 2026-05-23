import { SigninBodyDto } from './signin-body.dto';

export class SignupBodyDto extends SigninBodyDto {
  declare fullname: string;
}
