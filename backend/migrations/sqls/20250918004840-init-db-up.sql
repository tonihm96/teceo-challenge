-- CREATE EXTENSION IF NOT EXISTS "UUID-OSSP";
-- CREATE EXTENSION IF NOT EXISTS "PGCRYPTO";

CREATE TABLE PUBLIC.PRODUCTS (
    ID          UUID        NOT NULL DEFAULT UUID_GENERATE_V4(),
    CREATED_AT  TIMESTAMP   NOT NULL DEFAULT NOW(),
    UPDATED_AT  TIMESTAMP   NOT NULL DEFAULT NOW(),
    CODE        TEXT        NOT NULL,
    NAME        TEXT        NOT NULL,
    DESCRIPTION TEXT        NOT NULL,
    IMAGE_URL   TEXT        NULL,
    CONSTRAINT PK_PRODUCTS  PRIMARY KEY (ID)
);

CREATE TABLE PUBLIC.COLORS (
    ID          UUID        NOT NULL DEFAULT UUID_GENERATE_V4(),
    CREATED_AT  TIMESTAMP   NOT NULL DEFAULT NOW(),
    UPDATED_AT  TIMESTAMP   NOT NULL DEFAULT NOW(),
    CODE        TEXT        NOT NULL,
    NAME        TEXT        NOT NULL,
    HEX_CODE    TEXT        NOT NULL,
    CONSTRAINT PK_COLORS    PRIMARY KEY (ID)
    -- CONSTRAINT UK_COLORS_CODE UNIQUE (CODE)
);

CREATE TABLE PUBLIC.PRODUCT_COLORS (
    ID          UUID        NOT NULL DEFAULT UUID_GENERATE_V4(),
    CREATED_AT  TIMESTAMP   NOT NULL DEFAULT NOW(),
    UPDATED_AT  TIMESTAMP   NOT NULL DEFAULT NOW(),
    PRODUCT_ID  UUID        NOT NULL,
    COLOR_ID    UUID        NOT NULL,
    CONSTRAINT PK_PRODUCT_COLORS PRIMARY KEY (ID),
    CONSTRAINT FK_PRODUCT_COLORS_PRODUCT FOREIGN KEY (PRODUCT_ID) REFERENCES PUBLIC.PRODUCTS (ID),
    CONSTRAINT FK_PRODUCT_COLORS_COLOR FOREIGN KEY (COLOR_ID) REFERENCES PUBLIC.COLORS (ID)
    -- CONSTRAINT UK_PRODUCT_COLORS UNIQUE (PRODUCT_ID, COLOR_ID)
);


CREATE TABLE PUBLIC.PRODUCT_SIZES (
    ID          UUID        NOT NULL DEFAULT UUID_GENERATE_V4(),
    CREATED_AT  TIMESTAMP   NOT NULL DEFAULT NOW(),
    UPDATED_AT  TIMESTAMP   NOT NULL DEFAULT NOW(),
    PRODUCT_ID  UUID        NOT NULL,
    NAME        TEXT        NOT NULL,
    CONSTRAINT PK_PRODUCT_SIZES PRIMARY KEY (ID),
    CONSTRAINT FK_PRODUCT_SIZES_PRODUCT_ID FOREIGN KEY (PRODUCT_ID) REFERENCES PUBLIC.PRODUCTS (ID)
    -- CONSTRAINT UK_PRODUCT_SIZES UNIQUE (PRODUCT_ID, NAME)
);

CREATE TABLE PUBLIC.SKUS (
    ID                UUID        NOT NULL DEFAULT UUID_GENERATE_V4(),
    CREATED_AT        TIMESTAMP   NOT NULL DEFAULT NOW(),
    UPDATED_AT        TIMESTAMP   NOT NULL DEFAULT NOW(),
    PRODUCT_COLOR_ID  UUID  NOT NULL,
    PRODUCT_SIZE_ID   UUID  NOT NULL,
    PRICE NUMERIC     NOT NULL DEFAULT 0,
    CONSTRAINT PK_SKUS PRIMARY KEY (ID),
    CONSTRAINT FK_SKUS_PRODUCT_COLOR_ID FOREIGN KEY (PRODUCT_COLOR_ID) REFERENCES PUBLIC.PRODUCT_COLORS (ID),
    CONSTRAINT FK_SKUS_PRODUCT_SIZE_ID FOREIGN KEY (PRODUCT_SIZE_ID) REFERENCES PUBLIC.PRODUCT_SIZES (ID),
    CONSTRAINT UK_SKUS UNIQUE (PRODUCT_COLOR_ID, PRODUCT_SIZE_ID)
);

CREATE TABLE PUBLIC.CUSTOMERS (
    ID          UUID        NOT NULL DEFAULT UUID_GENERATE_V4(),
    CREATED_AT  TIMESTAMP   NOT NULL DEFAULT NOW(),
    UPDATED_AT  TIMESTAMP   NOT NULL DEFAULT NOW(),
    NAME        TEXT        NOT NULL,
    EMAIL       TEXT        NOT NULL,
    CONSTRAINT PK_CUSTOMERS PRIMARY KEY (ID)
    -- CONSTRAINT UK_CUSTOMER_EMAIL UNIQUE (EMAIL)
);

CREATE TYPE ORDER_STATUS  AS ENUM ('DRAFT', 'CANCELED', 'SENT');

CREATE TABLE PUBLIC.ORDERS (
    ID          UUID        NOT NULL DEFAULT UUID_GENERATE_V4(),
    CREATED_AT  TIMESTAMP   NOT NULL DEFAULT NOW(),
    UPDATED_AT  TIMESTAMP   NOT NULL DEFAULT NOW(),
    CUSTOMER_ID UUID        NOT NULL,
    TOTAL       NUMERIC     NOT NULL DEFAULT 0,
    STATUS      ORDER_STATUS NOT NULL DEFAULT 'DRAFT',
    CONSTRAINT PK_ORDERS PRIMARY KEY (ID),
    CONSTRAINT FK_ORDERS_CUSTOMER_ID FOREIGN KEY (CUSTOMER_ID) REFERENCES PUBLIC.CUSTOMERS (ID)
);

CREATE TABLE PUBLIC.ORDER_ITEMS (
    ID          UUID        NOT NULL DEFAULT UUID_GENERATE_V4(),
    CREATED_AT  TIMESTAMP   NOT NULL DEFAULT NOW(),
    UPDATED_AT  TIMESTAMP   NOT NULL DEFAULT NOW(),
    SKU_ID      UUID        NOT NULL,
    ORDER_ID    UUID        NOT NULL,
    QUANTITY    NUMERIC     NOT NULL DEFAULT 0,
    CONSTRAINT PK_ORDER_ITEMS PRIMARY KEY (ID),
    CONSTRAINT FK_ORDER_ITEMS_SKU_ID FOREIGN KEY (SKU_ID) REFERENCES PUBLIC.SKUS (ID),
    CONSTRAINT FK_ORDER_ITEMS_ORDER_ID FOREIGN KEY (ORDER_ID) REFERENCES PUBLIC.ORDERS (ID)
);

-- Extensão para buscas ILIKE rápidas com trigramas
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Foreign key de product_colors para products
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fk_product_colors_product_id ON product_colors (product_id);

-- Foreign key de product_colors para colors
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fk_product_colors_color_id ON product_colors (color_id);

-- Foreign key de skus para product_colors
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fk_skus_product_color_id ON skus (product_color_id);

-- Índice composto para cálculo de MIN(price) em product_colors para permitir index only scan
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_skus_product_color_price ON skus (product_color_id, price);

-- Para ordenação por nome do produto
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_name ON products (name);

-- Para filtros ILIKE pelo campo "code" do produto
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_code_trgm ON products USING gin (code gin_trgm_ops);

-- Para filtros ILIKE pelo campo "name" do produto
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_name_trgm ON products USING gin (name gin_trgm_ops);

-- Para ordenação case-insensitive por cor - LOWER(color.name)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_colors_name_lower ON colors (LOWER(name));

-- Índice composto para ordenação por nome do produto e id
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_name_id ON products (name, id);

-- Índice composto para product_colors em queries que usam product_id, color_id e id juntos
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_colors_composite ON product_colors (product_id, color_id, id);

-- Para ordenação/filtro por nome da cor (sem case-insensitive)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_colors_name ON colors (name);

-- Para o WHERE order.id IN (...) em getOrdersWithTotals
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fk_order_items_order_id ON order_items (order_id);

-- Para o LEFT JOIN com SKUs em getOrdersWithTotals
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fk_order_items_sku_id ON order_items (sku_id);

-- Para o join em countQueryBuilder.leftJoin('order.customer', 'customer')
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fk_orders_customer_id ON orders (customer_id);

-- Para busca case insensitive pelo nome do cliente (filtro customerNameOrEmail)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_name_trgm ON customers USING gin (name gin_trgm_ops);

-- Para busca case insensitive pelo email do cliente
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_email_trgm ON customers USING gin (email gin_trgm_ops);

ANALYZE orders;

ANALYZE order_items;

ANALYZE customers;

ANALYZE products;

ANALYZE colors;

ANALYZE product_colors;

ANALYZE skus;