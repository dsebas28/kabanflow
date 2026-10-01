-- titulo: Tarjetas vencidas y próximas a vencer
-- descripcion: FILTER cuenta en una sola pasada las tarjetas vencidas, las que vencen esta semana y las que no tienen fecha, por tablero. Las tarjetas de la última lista (hechas) no cuentan.
WITH pendientes AS (
    SELECT b.title AS tablero, c."dueDate"
    FROM "Card" c
    JOIN "List" l  ON l.id = c."listId"
    JOIN "Board" b ON b.id = l."boardId"
    WHERE l.position < (SELECT max(position) FROM "List" WHERE "boardId" = b.id)
)
SELECT tablero,
       count(*)                                                                      AS pendientes,
       count(*) FILTER (WHERE "dueDate" < now())                                     AS vencidas,
       count(*) FILTER (WHERE "dueDate" BETWEEN now() AND now() + interval '7 days') AS vencen_esta_semana,
       count(*) FILTER (WHERE "dueDate" IS NULL)                                     AS sin_fecha
FROM pendientes
GROUP BY tablero
ORDER BY vencidas DESC, pendientes DESC;
