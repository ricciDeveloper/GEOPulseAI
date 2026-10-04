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

No deploy da Vercel, o `vercel.json` agenda a sincronização RSS a cada hora. Configure `CRON_SECRET` nas variáveis de ambiente do projeto; o endpoint rejeita chamadas sem o bearer token correspondente.

O banco usa SQLite no arquivo `packages/database/prisma/dev.db`; não é necessário configurar `DATABASE_URL` para desenvolvimento local. Se definida, `DATABASE_URL` pode apontar para outro arquivo SQLite (`file:...`). Para sincronizar o schema, use `npm run db:push --workspace=@geopulse/database`; para inspecionar os dados, use `npm run db:studio --workspace=@geopulse/database`. Em funções serverless da Vercel, o sistema de arquivos não é persistente entre execuções, então o SQLite local não é adequado para persistência de produção.

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