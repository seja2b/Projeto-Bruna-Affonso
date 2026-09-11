# Como funciona na prática — editor completo

Branch: `feat/como-funciona-editor` (base: `origin/main`).

## Etapas preservadas
1. Aulas Gravadas
2. Acompanhamento Personalizado
3. Correção de Exercícios
4. Avaliação e Progresso
5. Desafios e Parcerias
6. Treinos Bônus

Os destaques legados “Estruturado e planejado” e “Com total acompanhamento” são mantidos quando `items` ainda não existe. Uma lista vazia é respeitada. Campos personalizados das etapas são preservados.

## Alterações
- Painel: Conteúdo do site > Como funciona na prática?, edição de título, descrição e destaques por etapa.
- Imagem por etapa: upload JPG/PNG/WebP (até 8 MB), otimização, preview, link HTTPS, troca e remoção.
- Botão explícito de publicação com mensagens de falha e sessão expirada; alterações permanecem em prévia até publicar.
- Persistência no binding `CODES` existente, chave isolada `editorial:steps:v1`, reutilizando a sessão administrativa existente. Nenhuma migração de banco ou novo serviço.
- `GET /api/content/steps` público e `POST /api/admin/content/steps` autenticado. Limites de payload e validação de conteúdo no servidor.
- Página pública carrega a configuração compartilhada; mantém textos e fallback sem imagem ou em falha de carregamento. Layout alternado no desktop e coluna única no mobile, imagens com object-fit cover e cantos arredondados.
- As outras seções não foram modificadas. A alteração anterior de Fotos do Método não foi incorporada (não está em origin/main).

## Validação
- `node --test tests/steps.cjs` (Playwright disponível no ambiente; Edge local).
- Verificação de sintaxe de todos os módulos e do script inline.
- `wrangler deploy --dry-run --outdir build` — sem deploy.
- Seis etapas conferidas em 1440px e 390px, publicação, visitante sem armazenamento local, upload em todas as etapas, edição dos destaques, remoção, rejeição de arquivo inválido e autenticação.

## Publicação e limites
Requer revisão e deploy do Worker após merge: o HTML existente é carregado de main pelo Worker. Não houve merge nem deploy automático. A primeira publicação importa as etapas atuais do navegador administrador quando ainda não há conteúdo compartilhado. Configurações antigas presentes apenas em outros navegadores não podem ser descobertas pelo servidor.

Workers KV tem consistência eventual. A revisão evita sobrescritas de versões já observadas, mas não garante exclusão mútua de publicações simultâneas entre regiões. As imagens otimizadas são persistidas no documento da seção (máximo de 6 MiB por publicação), sem introduzir outro armazenamento.
