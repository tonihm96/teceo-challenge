import { useInfiniteQuery } from '@tanstack/react-query';
import { useApplicationContext } from '../../../global/contexts/ApplicationContext';
import type { ProductColorDTO } from '../../interfaces/product-color.dto';
import homeRepository from '../../repositories/home.repository';

const useHomeProductColorList = () => {
  const { search, handleLoadingStatus } = useApplicationContext();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
  } = useInfiniteQuery({
    queryKey: ['product-colors', search],
    queryFn: async ({ pageParam, signal }) => {
      return handleLoadingStatus<ProductColorDTO[]>({
        disabled: !search?.length,
        requestFn: async () => {
          const response = await homeRepository().getProductColors({
            page: pageParam,
            search,
            signal,
          });
          return response.data.data;
        },
      });
    },
    getNextPageParam: (lastPage, pages) => {
      if (!lastPage.length) {
        return undefined;
      }

      return pages.length;
    },
    initialPageParam: 0,
  });

  return {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
  };
};

export default useHomeProductColorList;
