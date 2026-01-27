## Backend

- Adicionado valor máximo para o campo "limit" no BaseFilter para evitar sobrecarga do banco de dados e da API
- Adicionado valor padrão para o campo "limit" no BaseFilter para garantir que sempre haja um limite definido nas consultas
- Referência "productSize" no model Sku estava apontando para "Color", corrigido para "ProductSize"
- Filtro por código ou nome de produto em ListProductColorsFilter corrigido para comparar o parâmetro diretamente com os campos "code" e "name" do produto, ao invés de filtrar por IDs de produtos correspondentes
- Campos "skip" e "take" em BaseFilter foram substituídos por "offset" e "limit" respectivamente, para otimizar o desempenho das consultas com paginação
- Consulta para listar ProductColors foi otimizada nos pontos a seguir:
  - A paginação foi otimizada para utilizar "OFFSET" e "LIMIT" ao invés dos métodos "skip" e "take" do TypeORM, que geram consultas menos eficientes para o volume de dados esperado
  - O método foi reestruturado para buscar primeiro os dados em ProductColors, e depois buscar os dados relacionados (produtos, cores e preços) em lotes, ao invés de buscar individualmente para cada ProductColor retornado - isso também reduziu o número de conexões com o banco de dados - eliminando o problema de N+1 queries
  - A busca pelos preços mínimos foi otimizada para utilizar uma única consulta agregada, ao invés de buscar individualmente para cada ProductColor retornado
  - A consulta para contar o total de registros foi otimizada para contar os registros diretamente na tabela de ProductColors, e usar JOIN apenas se necessário (quando há filtro por código ou nome do produto)
  - Se o total de registros for zero, a consulta principal é evitada e uma página vazia é retornada imediatamente

## Frontend

- Parâmetros de paginação atualizados para utilizar "offset" ao invés de "skip", alinhando com as mudanças no backend
- Parâmetro "signal" foi adicionado a todas as chamadas de repositório para evitar chamadas desnecessárias quando o componente é desmontado ou a consulta é cancelada, e para organizar melhor os parâmetros das funções, uma interface options foi criada para os métodos que possuem múltiplos parâmetros
- min-width de 100vw removido do CSS global para evitar scroll horizontal indesejado
