import {
  Checkbox,
  MenuItem,
  Select,
  Stack,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import useMoney from '../../../hooks/useMoney';
import theme from '../../../theme/theme';
import type { OrderStatus } from '../enums/orderStatus.enum';
import type { ListItem } from '../interfaces/orders-list-item.interface';
import { orderStatusMapper } from '../utils/orderStatus.mapper';
import OrderStatusDot from './OrderStatusDot';
import { coolToggledAnimation } from './orderListItem.styles';
import type { Ref } from 'react';

interface OrdersListItemProps {
  ref?: Ref<HTMLTableRowElement>; // react 19 allows passing ref as prop
  item: ListItem;
  onChangeStatus: (newStatus: OrderStatus) => void;
  isToggled: boolean;
  onToggle: (orderId: string) => void;
}

const OrdersListItem = ({
  ref,
  item,
  onChangeStatus,
  isToggled,
  onToggle,
}: OrdersListItemProps) => {
  const { format } = useMoney();

  return (
    <TableRow
      ref={ref}
      sx={{
        '&:last-child td, &:last-child th': { border: 0 },
        backgroundColor: isToggled
          ? `${theme.palette.primary.main}15`
          : 'inherit',
      }}
    >
      <TableCell padding="checkbox">
        <Checkbox
          size="small"
          checked={isToggled}
          onChange={() => onToggle(item.id)}
        />
      </TableCell>
      <TableCell component="th" scope="row">
        <Typography variant="body2">{item.customerName}</Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2">{item.customerEmail}</Typography>
      </TableCell>
      <TableCell align="right">
        <Typography variant="body2">{item.totalProductColors}</Typography>
      </TableCell>
      <TableCell align="right">
        <Typography variant="body2">{item.totalQuantity}</Typography>
      </TableCell>
      <TableCell align="right">
        <Typography variant="body2">{format(item.totalValue)}</Typography>
      </TableCell>
      <TableCell align="right">
        <Typography variant="body2">
          {format(item.averageValuePerProductColor)}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Typography variant="body2">
          {format(item.averageValuePerUnit)}
        </Typography>
      </TableCell>
      <TableCell>
        <Select
          disableUnderline
          variant="filled"
          size="small"
          value={item.status}
          onChange={(e) => onChangeStatus(e.target.value)}
          MenuProps={{
            PaperProps: {
              sx: { ...(isToggled && coolToggledAnimation) },
            },
          }}
          sx={{
            ...(isToggled && coolToggledAnimation),
            borderRadius: '4px',
            minWidth: 140,
            '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
              paddingY: 0.5,
            },
          }}
        >
          {Object.entries(orderStatusMapper).map(([status, { label }]) => (
            <MenuItem key={status} value={status}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <OrderStatusDot status={status as OrderStatus} />
                <Typography variant="body2">{label}</Typography>
              </Stack>
            </MenuItem>
          ))}
        </Select>
      </TableCell>
    </TableRow>
  );
};

export default OrdersListItem;
