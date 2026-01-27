import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

export default abstract class BaseFilter<T extends ObjectLiteral> {
  constructor(data?: Partial<BaseFilter<T>>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  abstract createWhere(queryBuilder: SelectQueryBuilder<T>, alias: string): void;

  paginate(queryBuilder: SelectQueryBuilder<T>) {
    if (this.offset) {
      queryBuilder.offset(this.offset);
    }
    if (this.limit) {
      queryBuilder.limit(this.limit);
    }
  }
}
