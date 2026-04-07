import { IsNotEmpty } from 'class-validator';

export class CreateLessonDto {
  @IsNotEmpty({ message: 'Title không được để trống' })
  title!: string;

  @IsNotEmpty({ message: 'Type không được để trống' })
  type!: string;

  @IsNotEmpty({ message: 'Content không được để trống' })
  content!: string;

  @IsNotEmpty({ message: 'Video URL không được để trống' })
  videoUrl!: string;

  // @IsNotEmpty({ message: 'Order không được để trống' })
  // order!: string;

  @IsNotEmpty({ message: 'Section ID không được để trống' })
  sectionId!: string;
}
