# Otimizações para Firebase (plano Spark / free)

O projeto está ajustado para respeitar os limites diários do Firestore no plano **Spark (gratuito)**:

| Recurso   | Limite diário (Spark) |
|----------|-------------------------|
| Leituras | 50.000                  |
| Escritas | 20.000                  |
| Exclusões | 20.000                 |

## O que foi feito no código

### Leituras (50K/dia)
- **Relatório de Consumo:** consultas a `airscan_dados_ia` com `limit(2000)` — cada abertura da tela consome no máximo 2.000 leituras (+ redes/ativos).
- **Diagnóstico de IA:** consultas a `airscan_diagnostico_ia` com `limit(500)` — no máximo 500 leituras por tela (+ redes/ativos).
- Índices compostos em `firestore.indexes.json` evitam leituras desnecessárias.

### Escritas (20K/dia)
- **Cron sync-readings:** 1 execução por dia → 1 escrita por ativo (ex.: 50 ativos = 50 escritas/dia).
- **Telas de equipamento (admin e cliente):** gravação em `airscan_dados_ia` limitada a **no máximo 1 escrita por minuto por ativo** (throttle). Com polling a cada 5 s, sem throttle seriam 12/min; com throttle fica 1/min por aba aberta.
- **Diagnóstico:** 1 escrita em `airscan_diagnostico_ia` por vazamento ao ser finalizado (baixo volume).

### Exclusões (20K/dia)
- **Cron cleanup-old-readings:** apaga documentos com mais de 60 dias, com **teto de 5.000 exclusões por execução** (1x/dia). Assim sobra cota para outras operações no mesmo dia.

## Se precisar de mais cota

- Aumentar limites nas consultas (ex.: `limit(5000)`) ou remover o throttle de 1 min nas telas de equipamento **aumenta o uso**; no Spark pode ser necessário subir para o plano **Blaze (pay-as-you-go)**.
- No Blaze, paga-se apenas o que passar do que seria o free tier; os limites do Spark continuam “grátis” e o excedente é cobrado.
