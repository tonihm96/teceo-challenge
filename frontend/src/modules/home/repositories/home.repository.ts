import { api } from '../../../config/config';
import type { PageDTO } from '../../../interfaces/page.interface';
import type { HomeRepositoryGetProductColorsOptions } from '../interfaces/home-repository-get-product-colors-options.interface';
import type { ProductColorDTO } from '../interfaces/product-color.dto';

const homeRepository = () => {
  const getProductColors = ({
    page,
    signal,
    search,
  }: HomeRepositoryGetProductColorsOptions) => {
    const limit = 10;
    return api.get<PageDTO<ProductColorDTO>>('/product-colors', {
      params: {
        limit,
        offset: page * limit,
        productCodeOrName: search,
      },
      signal,
    });
  };

  return {
    getProductColors,
  };
};

export default homeRepository;
