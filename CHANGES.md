## Backend

- Adicionado valor máximo para o campo "limit" no BaseFilter para evitar sobrecarga do banco de dados e da API
- Adicionado valor padrão para o campo "limit" no BaseFilter para garantir que sempre haja um limite definido nas consultas
- Referência "productSize" no model Sku estava apontando para "Color", corrigido para "ProductSize"
- Filtro por código ou nome de produto em ListProductColorsFilter corrigido para comparar o parâmetro diretamente com os campos "code" e "name" do produto, ao invés de filtrar por IDs de produtos correspondentes
- Campo "skip" em BaseFilter foi substituído por "offset" para otimizar o desempenho das consultas com paginação
- Consulta para listar ProductColors foi otimizada nos pontos a seguir:
  - A paginação foi alterada para utilizar "OFFSET" ao invés do método "skip" do TypeORM, que gera consultas menos eficientes para o volume de dados esperado
  - O método foi reestruturado para buscar primeiro os dados em ProductColors, e depois buscar os dados relacionados (produtos, cores e preços) em lotes, ao invés de buscar individualmente para cada ProductColor retornado - isso também reduziu o número de conexões com o banco de dados - eliminando o problema de N+1 queries
  - A busca pelos preços mínimos foi otimizada para utilizar uma única consulta agregada, ao invés de buscar individualmente para cada ProductColor retornado
  - A consulta para contar o total de registros foi otimizada para contar os registros diretamente na tabela de ProductColors, e usar JOIN apenas se necessário (quando há filtro por código ou nome do produto)
  - Se o total de registros for zero, a consulta principal é evitada e uma página vazia é retornada imediatamente
- Consulta para listar Orders foi otimizada nos pontos a seguir:
  - A paginação foi alterada para utilizar "OFFSET" ao invés do método "skip" do TypeORM, assim como no método list de ProductColors
  - A busca pelos pedidos foi reestruturada para buscar primeiro os dados em Orders, buscar os itens relacionados em lote, e depois unir os dados em memória, reduzindo o número de conexões com o banco de dados e eliminando o problema de N+1 queries. A lógica de cálculo dos totais foi mantida, mas agora opera sobre os dados já carregados em memória
  - A consulta para contar o total de registros foi otimizada para contar os registros diretamente na tabela de Orders, e usar JOIN apenas se necessário (quando há filtro por nome ou email do cliente)
  - Se o total de registros for zero, a consulta principal é evitada e uma página vazia é retornada imediatamente
- No banco de dados diversos índices foram adicionados para otimizar as consultas de listagem de ProductColors e Orders, especialmente para os filtros e junções mais comuns (detalhes dos índices criados estão comentados nos arquivos de migrations)

## Frontend

- Parâmetros de paginação atualizados para utilizar "offset" ao invés de "skip", alinhando com as mudanças no backend
- Parâmetro "signal" foi adicionado a todas as chamadas de repositório para cancelar requisições pendentes quando o componente é desmontado ou a consulta é cancelada, e para organizar melhor os parâmetros das funções, uma interface options foi criada para os métodos que possuem múltiplos parâmetros
- min-width de 100vw removido do CSS global para evitar scroll horizontal indesejado
- min-height de 100vh removido do CSS global para evitar scroll vertical indesejado
- Componente OrdersList foi otimizado para utilizar virtualização de linhas com @tanstack/react-virtual, melhorando o desempenho ao renderizar listas de pedidos longas
- Componente HomeProductColorList foi otimizado para utilizar virtualização de cada linha da grid de produtos com @tanstack/react-virtual, melhorando o desempenho ao renderizar listas longas
- Valor de limite de paginação ajustado para 12 em home.repository.ts para alinhar com a quantidade de colunas exibidas na grid de produtos
- Usos de useInfiniteQuery foram atualizados para extrair apenas as propriedades utilizadas (removendo também uso de spread operator diretamente no objeto retornado pelo hook) para evitar re-renderizações desnecessárias dos componentes quando propriedades não utilizadas mudam (isso é documentado nas docs da biblioteca, o objeto retornado usa proxy para rastrear quais propriedades são acessadas: https://tanstack.com/query/latest/docs/framework/react/guides/render-optimizations#tracked-properties)
- No hook useOrdersList, as funções onChangeStatus e toggleOrderId e a query key foram memoizadas para estabilizar suas referências e evitar re-renderizações desnecessárias dos componentes que as utilizam
- No componente OrdersListItem a definição da função onChangeStatus foi atualizada para aceitar o ID do pedido como parâmetro, evitando a necessidade de criar uma nova função para cada item da lista
