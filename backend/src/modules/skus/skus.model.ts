import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import BaseModel from '../../../commons/models/base.model';
import ProductSize from '../product-sizes/product-sizes.model';
import ProductColor from '../product-colors/product-colors.model';

@Entity('skus')
export default class Sku extends BaseModel {
  @ManyToOne(() => ProductColor)
  @JoinColumn({ name: 'product_color_id', referencedColumnName: 'id' })
  productColor: ProductColor;

  @ManyToOne(() => ProductSize)
  @JoinColumn({ name: 'product_size_id', referencedColumnName: 'id' })
  productSize: ProductSize;

  @Column({ name: 'price', type: 'numeric' })
  price: number;
}
