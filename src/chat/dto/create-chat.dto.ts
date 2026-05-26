import {
  IsString,
  IsNotEmpty,
  IsMongoId,
  IsOptional,
  IsEnum,
  MaxLength,
  IsUrl,
} from 'class-validator';

export class CreateChatDto {
  @IsNotEmpty()
  @IsMongoId()
  courseId!: string;

  @IsNotEmpty()
  @IsMongoId()
  receiverId!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(5000)
  message!: string;

  @IsOptional()
  @IsEnum(['text', 'image', 'file'])
  messageType?: string = 'text';

  @IsOptional()
  @IsUrl()
  fileUrl?: string;

  @IsOptional()
  @IsString()
  fileName?: string;
}
