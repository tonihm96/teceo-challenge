import { IsOptional, IsString } from 'class-validator';
import { SelectQueryBuilder } from 'typeorm';
import BaseFilter from '../../../../commons/filters/base.filter';
import ProductColor from '../product-colors.model';

export default class ListProductColorsFilter extends BaseFilter<ProductColor> {
  @IsOptional()
  @IsString()
  productCodeOrName?: string;

  createWhere(queryBuilder: SelectQueryBuilder<ProductColor>): void {
    if (this.productCodeOrName) {
      queryBuilder.andWhere(
        '(product.code ILIKE :productCodeOrName OR product.name ILIKE :productCodeOrName)',
        { productCodeOrName: `%${this.productCodeOrName}%` },
      );
    }
  }
}
