import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import Page from '../../../commons/dtos/page.dto';
import { ListProductColorsDTO } from './dtos/list-product-colors.dto';
import ListProductColorsFilter from './dtos/list-product-colors.filter';
import { RawListProductColorDTO } from './dtos/raw-list-product-colors.dto';
import { RawPricesByProductColorIdsDTO } from './dtos/raw-prices-by-color-ids.dto';
import Product from '../products/products.model';
import Color from '../colors/colors.model';
import Sku from '../skus/skus.model';
import ProductColor from './product-colors.model';

@Injectable()
export default class ProductColorsService {
  constructor(
    @InjectRepository(ProductColor)
    private readonly repository: Repository<ProductColor>,
  ) {}

  createQueryBuilder(): SelectQueryBuilder<ProductColor> {
    return this.repository.createQueryBuilder('productColor');
  }

  async list(filter: ListProductColorsFilter): Promise<Page<ListProductColorsDTO>> {
    const countQueryBuilder = this.createQueryBuilder();

    if (filter.productCodeOrName) {
      countQueryBuilder.leftJoin('productColor.product', 'product');
    }

    filter.createWhere(countQueryBuilder);

    const total = await countQueryBuilder.getCount();

    const productColorQueryBuilder = this.createQueryBuilder()
      .leftJoin('productColor.product', 'product')
      .orderBy('product.name', 'ASC')
      .addOrderBy('productColor.id', 'ASC');

    filter.paginate(productColorQueryBuilder);
    filter.createWhere(productColorQueryBuilder);

    const productColors = await productColorQueryBuilder.getRawMany<RawListProductColorDTO>();

    const productColorIds = productColors.map((pc) => pc.productColor_id);
    const productIds = productColors.map((pc) => pc.productColor_product_id);
    const colorIds = productColors.map((pc) => pc.productColor_color_id);

    const uniqueProductIds = Array.from(new Set(productIds));
    const uniqueColorIds = Array.from(new Set(colorIds));

    const productsByProductIdsQueryBuilder = this.repository.manager
      .createQueryBuilder(Product, 'product')
      .where('product.id IN (:...productIds)', {
        productIds: uniqueProductIds,
      });

    const colorsByColorIdsQueryBuilder = this.repository.manager
      .createQueryBuilder(Color, 'color')
      .where('color.id IN (:...colorIds)', {
        colorIds: uniqueColorIds,
      });

    const pricesByProductColorIdsQueryBuilder = this.repository.manager
      .createQueryBuilder(Sku, 'sku')
      .select('sku.product_color_id', 'productColorId')
      .addSelect('MIN(sku.price)', 'minPrice')
      .where('sku.product_color_id IN (:...productColorIds)', { productColorIds: productColorIds })
      .groupBy('sku.product_color_id');

    const [productsByProductIds, colorsByColorIds, pricesByProductColorIds] = await Promise.all([
      productsByProductIdsQueryBuilder.getMany(),
      colorsByColorIdsQueryBuilder.getMany(),
      pricesByProductColorIdsQueryBuilder.getRawMany<RawPricesByProductColorIdsDTO>(),
    ]);

    const productMap = new Map(productsByProductIds.map((p) => [p.id, p]));
    const colorMap = new Map(colorsByColorIds.map((c) => [c.id, c]));
    const priceMap = new Map(
      pricesByProductColorIds.map((p) => [p.productColorId, parseFloat(p.minPrice)]),
    );

    const result: ListProductColorsDTO[] = productColors.map((item) => {
      const productId = item.productColor_product_id;
      const colorId = item.productColor_color_id;
      const productColorId = item.productColor_id;

      return {
        id: productColorId,
        createdAt: item.productColor_created_at,
        updatedAt: item.productColor_updated_at,
        product: productMap.get(productId)!,
        color: colorMap.get(colorId)!,
        price: priceMap.get(productColorId) || 0,
      };
    });

    return Page.of(result, total);
  }
}
