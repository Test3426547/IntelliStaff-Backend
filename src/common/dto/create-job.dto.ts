import { IsString, IsArray, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateJobDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  company: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  requirements: string[];

  @ApiProperty()
  @IsString()
  location: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  salary?: string;

  @ApiProperty()
  @IsDateString()
  postedDate: Date;

  @ApiProperty()
  @IsString()
  source: string;
}
