import { Prop } from '@nestjs/mongoose';

export class BaseSchema {
  @Prop({ default: false })
  isDeleted!: boolean;

  @Prop({ default: null })
  deletedAt?: Date;
}
