-- titulo: Claves foráneas y borrado en cascada
-- descripcion: Las restricciones reales leídas del catálogo de PostgreSQL. Al borrar un tablero se borran sus listas, tarjetas, mensajes e historial (CASCADE); en cambio, no se puede borrar un usuario que escribió comentarios o mensajes (RESTRICT).
SELECT conrelid::regclass::text     AS tabla,
       pg_get_constraintdef(oid)    AS restriccion
FROM pg_constraint
WHERE contype = 'f' AND connamespace = 'public'::regnamespace
ORDER BY 1, 2;
