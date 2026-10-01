-- titulo: Resumen de cada tablero
-- descripcion: La misma cuenta que muestra la pantalla de tableros: listas, tarjetas, personas y progreso (las tarjetas de la última lista cuentan como hechas). DISTINCT ON encuentra la última lista de cada tablero.
WITH ultima_lista AS (
    SELECT DISTINCT ON ("boardId") "boardId", id
    FROM "List"
    ORDER BY "boardId", position DESC
)
SELECT b.title                                                        AS tablero,
       u.name                                                         AS propietario,
       count(DISTINCT l.id)                                           AS listas,
       count(c.id)                                                    AS tarjetas,
       count(c.id) FILTER (WHERE c."listId" = ul.id)                  AS hechas,
       round(100.0 * count(c.id) FILTER (WHERE c."listId" = ul.id) / nullif(count(c.id), 0)) AS progreso_pct,
       (SELECT count(*) FROM "BoardMember" m WHERE m."boardId" = b.id) + 1 AS personas
FROM "Board" b
JOIN "User" u             ON u.id = b."ownerId"
LEFT JOIN "List" l        ON l."boardId" = b.id
LEFT JOIN "Card" c        ON c."listId" = l.id
LEFT JOIN ultima_lista ul ON ul."boardId" = b.id
GROUP BY b.id, b.title, u.name
ORDER BY tarjetas DESC;
