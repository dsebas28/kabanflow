-- titulo: Una persona no puede estar dos veces en un tablero
-- descripcion: El índice único (boardId, userId) de BoardMember impide invitar dos veces a la misma persona, aunque lleguen dos peticiones a la vez. La sentencia se ejecuta dentro de una transacción que se revierte.
INSERT INTO "BoardMember" (id, "boardId", "userId", role)
SELECT 'duplicado', "boardId", "userId", role
FROM "BoardMember"
LIMIT 1;
