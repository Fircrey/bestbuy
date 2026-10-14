# BestBuy — Ranking de productos y marcas

Recomendador que compara dos productos a la vez y construye un ranking Elo según las preferencias de los compradores. Basado en la estructura de CourseMash (comparación A/B, Elo, filtros por perfil y contexto, votos en localStorage, exportación CSV y Top 10).

## Diseño propio

La fórmula Elo es la del proyecto original (K base = 32). El cambio propio es que **la intensidad del ajuste depende del perfil del comprador**:

| Perfil | K | Razón |
|---|---|---|
| Comprador general | 32 | Valor base del algoritmo original |
| Comprador que prioriza el ahorro | 24 | Preferencias más estables y cautelosas |
| Comprador que prioriza prestaciones | 40 | Decisiones más marcadas, que mueven el ranking con más fuerza |

Se implementa en `app.js` con `K_POR_PERFIL` y el parámetro `k` de `updateElo()`.

## Cómo probar

1. Abre `index.html` en el navegador (o usa la página publicada con GitHub Pages).
2. Elige un perfil, un criterio y una categoría.
3. Vota varias veces y observa cómo cambia el Top 10.
4. Cambia de perfil y compara cómo se mueven los mismos productos.
5. Exporta los votos con el botón de CSV.

## Límites

- Los datos se guardan en el navegador de cada persona; no se comparten.
- El ranking refleja preferencias registradas, no calidad objetiva ni ventas.
- Los productos y precios son de ejemplo.
