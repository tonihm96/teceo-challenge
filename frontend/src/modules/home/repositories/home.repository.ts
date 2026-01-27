import { api } from '../../../config/config';
import type { PageDTO } from '../../../interfaces/page.interface';
import type { ProductColorDTO } from '../interfaces/product-color.dto';

const homeRepository = () => {
  const getProductColors = (page: number, search?: string) => {
    const limit = 10;
    return api.get<PageDTO<ProductColorDTO>>('/product-colors', {
      params: {
        limit,
        offset: page * limit,
        productCodeOrName: search,
      },
    });
  };

  return {
    getProductColors,
  };
};

export default homeRepository;
