import { UserRoles } from '@/enums/user-roles.enum';

export class UserPayloadDto {
  declare userId: string;
  declare fullname: string;
  declare email: string;
  declare role: UserRoles;
  declare hasAccess: boolean;
}
