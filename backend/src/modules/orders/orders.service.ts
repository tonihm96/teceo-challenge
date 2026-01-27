import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import Page from '../../../commons/dtos/page.dto';
import OrderItemsService from '../order-items/order-items.service';
import { ListOrdersDTO } from './dtos/list-orders.dto';
import ListOrdersFilter from './dtos/list-orders.filter';
import Order from './orders.model';

@Injectable()
export default class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly repository: Repository<Order>,

    private readonly orderItemsService: OrderItemsService,
  ) {}

  createQueryBuilder(alias: string): SelectQueryBuilder<Order> {
    return this.repository.createQueryBuilder(alias);
  }

  async list(filter: ListOrdersFilter): Promise<Page<ListOrdersDTO>> {
    const countQueryBuilder = this.createQueryBuilder('order');

    if (filter.customerNameOrEmail) {
      countQueryBuilder.leftJoin('order.customer', 'customer');
    }

    filter.createWhere(countQueryBuilder);

    const total = await countQueryBuilder.getCount();

    if (total === 0) {
      return Page.EMPTY;
    }

    const queryBuilder = this.createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer')
      .orderBy('order.id', 'ASC');

    filter.createWhere(queryBuilder);
    filter.paginate(queryBuilder);

    const orders = await queryBuilder.getMany();
    const ordersWithTotals = await this.getOrdersWithTotals(orders);

    return Page.of(ordersWithTotals, total);
  }

  private async getOrdersWithTotals(orders: Order[]): Promise<ListOrdersDTO[]> {
    if (!orders.length) {
      return [];
    }

    const orderIds = orders.map((order) => order.id);

    const allOrderItems = await this.orderItemsService
      .createQueryBuilder('orderItem')
      .leftJoinAndSelect('orderItem.sku', 'sku')
      .leftJoinAndSelect('sku.productColor', 'productColor')
      .leftJoinAndSelect('orderItem.order', 'order')
      .where('order.id IN (:...orderIds)', { orderIds })
      .getMany();

    const itemsByOrderId = new Map<string, typeof allOrderItems>();

    allOrderItems.forEach((item) => {
      const orderId = item.order.id;
      if (!itemsByOrderId.has(orderId)) {
        itemsByOrderId.set(orderId, []);
      }
      itemsByOrderId.get(orderId)?.push(item);
    });

    const ordersWithTotals: ListOrdersDTO[] = [];

    for (const order of orders) {
      const orderItems = itemsByOrderId.get(order.id) || [];

      let totalValue = 0;
      orderItems.forEach((orderItem) => {
        totalValue += orderItem.sku.price * orderItem.quantity;
      });

      let totalQuantity = 0;
      orderItems.forEach((orderItem) => {
        totalQuantity += Number(orderItem.quantity);
      });

      const orderProductColorIds: string[] = [];
      orderItems.forEach((orderItem) => {
        if (orderItem.sku) {
          const productColorId = orderItem.sku.productColor.id;
          if (!orderProductColorIds.includes(productColorId)) {
            orderProductColorIds.push(productColorId);
          }
        }
      });
      const totalProductColors = orderProductColorIds.length;

      const averageValuePerUnit = totalQuantity
        ? parseFloat((totalValue / totalQuantity).toFixed(2))
        : 0;
      const averageValuePerProductColor = totalProductColors
        ? parseFloat((totalValue / totalProductColors).toFixed(2))
        : 0;

      ordersWithTotals.push({
        id: order.id,
        status: order.status,
        customer: order.customer,
        totalValue,
        totalQuantity,
        totalProductColors,
        averageValuePerUnit,
        averageValuePerProductColor,
      });
    }

    return ordersWithTotals;
  }

  async update(orderId: string, order: Partial<Order>) {
    await this.repository.update(orderId, order);
  }

  async batchUpdate(orderIds: string[], order: Partial<Order>): Promise<void> {
    for (const orderId of orderIds) {
      await this.update(orderId, order);
    }
  }
}
