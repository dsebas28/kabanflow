-- titulo: ¿A qué tableros puede entrar cada persona?
-- descripcion: La misma regla que aplica src/lib/boardAccess.ts: se entra a un tablero si eres su propietario o si tienes una fila en BoardMember, y de ahí sale tu rol.
SELECT u.name                                                          AS persona,
       b.title                                                         AS tablero,
       CASE WHEN b."ownerId" = u.id THEN 'OWNER' ELSE m.role::text END AS rol
FROM "User" u
JOIN "Board" b ON b."ownerId" = u.id
              OR EXISTS (SELECT 1 FROM "BoardMember" x WHERE x."boardId" = b.id AND x."userId" = u.id)
LEFT JOIN "BoardMember" m ON m."boardId" = b.id AND m."userId" = u.id
ORDER BY u.name, rol DESC, b.title;
