export interface OrdersRepositoryGetOrdersOptions {
  signal: AbortSignal;
  page: number;
  search?: string;
}
