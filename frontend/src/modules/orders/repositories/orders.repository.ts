import { api } from '../../../config/config';
import type { PageDTO } from '../../../interfaces/page.interface';
import type { OrderStatus } from '../enums/orderStatus.enum';
import type { OrderDTO } from '../interfaces/order.dto';

const ordersRepository = () => {
  const getOrders = (page: number, search?: string) => {
    const limit = 50;
    return api.get<PageDTO<OrderDTO>>('/orders', {
      params: {
        limit,
        offset: page * limit,
        customerNameOrEmail: search,
      },
    });
  };

  const updateOrderStatus = async (
    orderId: string,
    orderStatus: OrderStatus
  ): Promise<void> => {
    await api.patch(`/orders/${orderId}`, { status: orderStatus });
  };

  const updateBatchOrderStatus = async (
    orderIds: string[],
    orderStatus: OrderStatus
  ) => {
    await api.patch(`/orders/`, { status: orderStatus, orderIds });
  };

  return {
    getOrders,
    updateOrderStatus,
    updateBatchOrderStatus,
  };
};

export default ordersRepository;
