GeoPulse AI
===========

Plataforma inteligente para monitoramento contínuo de SEO, GEO, AEO, AI Search e tendências relacionadas a mecanismos de busca e IA generativa.

* * * * *

Visão Geral
-----------

O GeoPulse AI centraliza atualizações, insights e tendências do mercado de busca e IA em um único dashboard inteligente.

A plataforma coleta automaticamente conteúdos de múltiplas fontes, processa essas informações com IA, gera resumos estratégicos, detecta tendências emergentes e entrega insights acionáveis em tempo real.

* * * * *

Objetivos do Projeto
====================

-   Monitorar atualizações SEO/GEO/AEO
-   Detectar tendências antes do mercado
-   Centralizar fontes relevantes
-   Automatizar análises estratégicas
-   Gerar insights com IA
-   Criar alertas inteligentes
-   Possibilitar escalabilidade SaaS futura

Automação e Persistência
------------------------

O banco de dados usa PostgreSQL gerenciado pelo Supabase, acessado pelo Prisma no servidor. Copie .env.example para packages/database/.env e preencha as strings de conexão em DATABASE_URL e DIRECT_URL em Supabase > Project Settings > Database > Connection string. Use a conexão do pooler em modo Transaction (porta 6543) para a aplicação e a conexão direta (porta 5432) para migrações. As variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY são configuração pública do cliente Supabase; não substituem a conexão PostgreSQL usada pelo Prisma. Nunca exponha senha do banco ou chave service_role em variáveis NEXT_PUBLIC_*.

Após configurar as conexões, sincronize o schema com npm run db:push --workspace=@geopulse/database durante a configuração inicial. Para evoluir o banco de forma versionada, crie migrações com npm run db:migrate --workspace=@geopulse/database -- --name nome_da_migracao e aplique-as em produção com npm run db:deploy --workspace=@geopulse/database. Para inspecionar os dados, use npm run db:studio --workspace=@geopulse/database. O arquivo SQLite local anterior não é copiado automaticamente para o Supabase.

* * * * *

Principais Features
===================

Inteligência SEO/GEO
--------------------

-   GEO Score
-   AEO Score
-   AI Visibility Score
-   EEAT Analysis
-   Citation Probability
-   Semantic Authority Analysis

* * * * *

[Linkedin João Ricci](https://www.linkedin.com/in/joaoriccideveloper/)