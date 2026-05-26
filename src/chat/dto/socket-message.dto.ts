import {
  IsString,
  IsNotEmpty,
  IsMongoId,
  IsOptional,
  IsEnum,
  MaxLength,
} from 'class-validator';

export class SendMessageDto {
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
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsString()
  fileName?: string;
}

export class MarkAsReadDto {
  @IsNotEmpty()
  @IsMongoId()
  chatId!: string;
}

export class TypingIndicatorDto {
  @IsNotEmpty()
  @IsMongoId()
  courseId!: string;

  @IsNotEmpty()
  @IsMongoId()
  receiverId!: string;
}
