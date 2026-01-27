# COMPUTEC - Sistema de Inventario y Logística (Backend)

Backend desarrollado en NestJS para la gestión de inventario, bodegas y logística.

## Tecnologías

- NestJS
- PostgreSQL (Inventario y Logística)
- MongoDB (Usuarios y Roles)
- TypeORM
- Mongoose
- JWT

## Variables de entorno

Este backend lee la configuración desde variables de entorno usando `ConfigModule`.

- En local: crea un archivo `.env` basado en `.env.example`.
- En producción: usa variables del servidor o un `.env.production` y define `NODE_ENV=production`.

Claves importantes:

- Mongo: `MONGO_URI` (o `MONGODB_URI`)
- Postgres: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`

## Instalación

```bash
npm install
```

## Ejecutar

```bash
npm run start:dev
```

Producción:

```bash
npm run build
npm run start:prod
```
