# Firestore collections – leituras e diagnóstico

## airscan_dados_ia (leituras a cada 1 minuto)

Usada para **leituras periódicas** dos equipamentos de cada rede. Alimenta a tela **Relatório de Consumo**.

- **Quem grava**
  - **Cron (recomendado):** `GET /api/cron/sync-readings` — chame a cada 1 minuto. No Vercel, use `vercel.json` (crons) e defina a variável `CRON_SECRET` no projeto; em outro provedor, use um cron externo com `?secret=CRON_SECRET` ou header `x-cron-secret`.
  - **Admin (view-asset)** e **cliente (assets):** ao receber resposta da API do ativo, gravam também (comportamento atual).
- **Campos do documento**
  - `networkId`, `assetId`, `assetName`
  - `timestamp` (serverTimestamp)
  - `pressao`, `is_anomaly`, `status_sistema`
  - `mse`, `uncertainty`, `drift`, `lpm_vazamento`, `gap`, `threshold`, `duracao_minutos`, `severidade`
- **Relatório de Consumo:** lê desta collection (filtros por período, rede e equipamento).
- **Retenção:** documentos com mais de **60 dias** são apagados automaticamente pelo cron `GET /api/cron/cleanup-old-readings` (executado diariamente; em Vercel, 3h da manhã).

---

## airscan_diagnostico_ia (vazamentos detectados)

Usada para **um registro por evento de vazamento**, com data de início, data de fim, LPM e gasto em R$ ao final.

- **Quem grava**
  - **Ao finalizar o vazamento:** `leakController.resolveLeak(dbId)` lê o documento em `airscan_leaks`, calcula duração e custo total e grava **um** documento em `airscan_diagnostico_ia`.
- **Campos do documento**
  - `networkId`, `assetId`, `assetName`
  - `dataInicio`, `dataFim` (ISO string)
  - `lpm`, `severidade`, `duracao_minutos`, `custo_estimado` (R$)
  - `timestamp` (serverTimestamp)
- **Diagnóstico de IA (admin/cliente):** lê desta collection para histórico de falhas/vazamentos.
