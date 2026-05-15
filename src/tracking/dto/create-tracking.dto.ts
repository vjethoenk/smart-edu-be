import { Type } from 'class-transformer';
import { IsEnum, IsMongoId, IsNumber, IsOptional, Min } from 'class-validator';
import { TrackingEvent } from '../enums/tracking-event.enum';
import { TrackingItemType } from '../enums/item-type.enum';

export class CreateTrackingDto {
  @IsMongoId()
  lessonId!: string;

  @IsEnum(TrackingItemType)
  itemType!: TrackingItemType;

  @IsEnum(TrackingEvent)
  event!: TrackingEvent;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  currentTime?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  score?: number;
}
