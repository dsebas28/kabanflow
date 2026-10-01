-- titulo: Plan de ejecución: el chat de un tablero
-- descripcion: El chat pide los mensajes de un tablero ordenados por fecha. Con tan pocas filas PostgreSQL prefiere leer la tabla entera, así que aquí se desactiva el recorrido secuencial para ver el plan que usará cuando crezca: el índice (boardId, createdAt) localiza solo los mensajes de ese tablero en lugar de recorrer todos.
SET enable_seqscan = off;
EXPLAIN (ANALYZE, COSTS OFF, TIMING OFF, SUMMARY OFF, BUFFERS OFF)
SELECT body, "createdAt"
FROM "Message"
WHERE "boardId" = (SELECT id FROM "Board" WHERE title = 'Lanzamiento de producto')
ORDER BY "createdAt";
