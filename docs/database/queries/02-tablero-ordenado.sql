-- titulo: El tablero tal como se dibuja
-- descripcion: Listas y tarjetas ordenadas por la columna position, que es lo que actualiza el arrastrar y soltar. string_agg ... ORDER BY junta las tarjetas de cada lista en su orden real.
SELECT l.position                                       AS orden,
       l.title                                          AS lista,
       count(c.id)                                      AS tarjetas,
       string_agg(c.title, ' | ' ORDER BY c.position)   AS tarjetas_en_orden
FROM "List" l
JOIN "Board" b     ON b.id = l."boardId"
LEFT JOIN "Card" c ON c."listId" = l.id
WHERE b.title = 'Lanzamiento de producto'
GROUP BY l.id, l.position, l.title
ORDER BY l.position;
