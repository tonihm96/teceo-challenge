import {
  CircularProgress,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useMemo } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import useInfiniteScroll from '../../../hooks/useInfiniteScroll';
import useOrdersList from '../hooks/useOrdersList';
import { OrderDTO } from '../interfaces/order.dto';
import OrdersListItem from './OrdersListItem';

const OrdersList = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
    onChangeStatus,
    toggleOrderId,
    selectedOrderIds,
  } = useOrdersList();

  const orders = useMemo(
    () => data?.pages.flat() || ([] as OrderDTO[]),
    [data?.pages]
  );

  const virtualizer = useWindowVirtualizer({
    count: orders.length,
    estimateSize: () => 53,
    overscan: 5,
    getItemKey: (index) => orders.at(index)?.id ?? '',
  });

  const virtualizedOrders = virtualizer.getVirtualItems();

  const totalSize = virtualizer.getTotalSize();
  const paddingTop =
    virtualizedOrders.length > 0 ? (virtualizedOrders.at(0)?.start ?? 0) : 0;
  const paddingBottom =
    virtualizedOrders.length > 0
      ? totalSize - (virtualizedOrders.at(-1)?.end ?? 0)
      : 0;

  const loaderRef = useInfiniteScroll(
    fetchNextPage,
    !!hasNextPage,
    isFetchingNextPage
  );

  if (isPending) {
    return (
      <Grid container spacing={1}>
        {new Array(16).fill(1).map((_, index: number) => (
          <Grid size={12} key={index}>
            <Skeleton variant="rounded" width="100%" height={30} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (isError) {
    return <p>error</p>;
  }

  return (
    <>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small" aria-label="orders list">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" />
              <TableCell variant="head">
                <Typography>cliente</Typography>
              </TableCell>
              <TableCell variant="head">
                <Typography>e-mail</Typography>
              </TableCell>
              <TableCell variant="head" align="right">
                <Typography>quantidade de produto-cor</Typography>
              </TableCell>
              <TableCell variant="head" align="right">
                <Typography>peças</Typography>
              </TableCell>
              <TableCell variant="head" align="right">
                <Typography>total</Typography>
              </TableCell>
              <TableCell variant="head" align="right">
                <Typography>valor médio por produto-cor</Typography>
              </TableCell>
              <TableCell variant="head" align="right">
                <Typography>valor médio por peça</Typography>
              </TableCell>
              <TableCell variant="head">
                <Typography>status</Typography>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paddingTop > 0 && (
              <TableRow style={{ height: paddingTop }}>
                <TableCell colSpan={9} style={{ border: 0, padding: 0 }} />
              </TableRow>
            )}

            {virtualizedOrders.map(({ index, key }) => {
              const order = orders.at(index);
              if (!order) return null;
              return (
                <OrdersListItem
                  key={key}
                  ref={virtualizer.measureElement}
                  data-index={index}
                  item={OrderDTO.toListItem(order)}
                  onToggle={toggleOrderId}
                  isToggled={selectedOrderIds.includes(order.id)}
                  onChangeStatus={(newStatus) =>
                    onChangeStatus(newStatus, order.id)
                  }
                />
              );
            })}

            {paddingBottom > 0 && (
              <TableRow style={{ height: paddingBottom }}>
                <TableCell colSpan={9} style={{ border: 0, padding: 0 }} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <div ref={loaderRef} style={{ height: 1 }} />

      {isFetchingNextPage && (
        <Stack alignItems="center" padding={2} paddingTop={1}>
          <CircularProgress size="24px" />
        </Stack>
      )}
    </>
  );
};

export default OrdersList;
