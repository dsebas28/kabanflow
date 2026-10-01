-- titulo: Historial reciente del tablero
-- descripcion: Lo que muestra la pestaña Actividad: los últimos eventos con su autor, leídos en orden gracias al índice compuesto (boardId, createdAt).
SELECT to_char(a."createdAt", 'YYYY-MM-DD HH24:MI')  AS fecha,
       u.name                                        AS persona,
       a.text                                        AS que_hizo
FROM "Activity" a
JOIN "User" u  ON u.id = a."actorId"
JOIN "Board" b ON b.id = a."boardId"
WHERE b.title = 'Lanzamiento de producto'
ORDER BY a."createdAt" DESC
LIMIT 10;
