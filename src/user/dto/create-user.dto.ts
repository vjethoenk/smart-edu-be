import { IsNotEmpty } from "class-validator";

export class CreateUserDto {
    @IsNotEmpty({ message: 'Name không được bỏ trống' })
    name!: string;
}
