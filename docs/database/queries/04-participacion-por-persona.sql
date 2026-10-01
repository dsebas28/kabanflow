-- titulo: Participación de cada persona
-- descripcion: UNION ALL combina tres tablas distintas (comentarios, mensajes del chat e historial) en un solo conteo por usuario, pivotado con FILTER.
WITH acciones AS (
    SELECT "authorId" AS usuario, 'comentario' AS tipo FROM "Comment"
    UNION ALL
    SELECT "authorId", 'mensaje' FROM "Message"
    UNION ALL
    SELECT "actorId", 'actividad' FROM "Activity"
)
SELECT u.name                                        AS persona,
       count(*) FILTER (WHERE tipo = 'comentario')   AS comentarios,
       count(*) FILTER (WHERE tipo = 'mensaje')      AS mensajes,
       count(*) FILTER (WHERE tipo = 'actividad')    AS acciones_en_historial,
       count(*)                                      AS total
FROM acciones a
JOIN "User" u ON u.id = a.usuario
GROUP BY u.name
ORDER BY total DESC;
