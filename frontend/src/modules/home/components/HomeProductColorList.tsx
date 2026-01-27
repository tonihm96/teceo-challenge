import { Box, CircularProgress, Grid, Skeleton, Stack } from '@mui/material';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import useInfiniteScroll from '../../../hooks/useInfiniteScroll';
import { ProductColorDTO } from '../interfaces/product-color.dto';
import HomeProductColorListItem from './HomeProductColorListItem';
import useHomeProductColorList from './hooks/useHomeProductColorList';

const ROW_COLUMN_COUNT = 4;

const HomeProductColorList = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
  } = useHomeProductColorList();

  const loaderRef = useInfiniteScroll(
    fetchNextPage,
    !!hasNextPage,
    isFetchingNextPage
  );

  const productColors = data?.pages.flat() || [];
  const productColorsRowCount = Math.ceil(
    productColors.length / ROW_COLUMN_COUNT
  );

  const virtualizer = useWindowVirtualizer({
    count: productColorsRowCount,
    estimateSize: () => 380,
    overscan: 2,
  });

  const virtualizedProductColors = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();
  const paddingTop =
    virtualizedProductColors.length > 0
      ? (virtualizedProductColors.at(0)?.start ?? 0)
      : 0;
  const paddingBottom =
    virtualizedProductColors.length > 0
      ? totalSize - (virtualizedProductColors.at(-1)?.end ?? 0)
      : 0;

  if (isPending) {
    return (
      <Grid container spacing={2}>
        {new Array(8).fill(1).map((_, index: number) => (
          <Grid size={{ xs: 6, sm: 4, md: 3 }} key={index}>
            <Skeleton variant="rounded" width="100%" height={300} />
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
      <div style={{ height: paddingTop }} />

      {virtualizedProductColors.map(({ index, key }) => {
        const startIndex = index * ROW_COLUMN_COUNT;
        const productColorColumns = productColors.slice(
          startIndex,
          startIndex + ROW_COLUMN_COUNT
        );

        return (
          <Box
            key={key}
            data-index={index}
            ref={virtualizer.measureElement}
            sx={{ marginBottom: 2 }}
          >
            <Grid container spacing={2}>
              {productColorColumns.map((productColor) => (
                <Grid size={{ xs: 6, sm: 4, md: 3 }} key={productColor.id}>
                  <HomeProductColorListItem
                    item={ProductColorDTO.toCardItem(productColor)}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        );
      })}

      <div style={{ height: paddingBottom }} />

      <div ref={loaderRef} style={{ height: 10 }} />

      {isFetchingNextPage && (
        <Stack alignItems="center" padding={2}>
          <CircularProgress size="24px" />
        </Stack>
      )}
    </>
  );
};

export default HomeProductColorList;
