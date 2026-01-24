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
  skip?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  abstract createWhere(queryBuilder: SelectQueryBuilder<T>, alias: string): void;

  paginate(queryBuilder: SelectQueryBuilder<T>) {
    if (this.skip) {
      queryBuilder.skip(this.skip);
    }
    if (this.limit) {
      queryBuilder.take(this.limit);
    }
  }
}
