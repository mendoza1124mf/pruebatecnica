# Prueba fullstack

## Arquitectura

```
                        ┌─────────────────────────────┐
                        │   FastAPI Document API :8000 │
                        │  POST /api/v1/documents/...  │
                        │  GET  /api/v1/documents/...  │
                        └──────────┬──────────────────┘
                                   │ HTTP (processing.py)
                        ┌──────────▼──────────────────┐
                        │   SOAP Gateway Flask :8001   │
                        │  POST /api/v1/compliance/check          │
                        │  GET  /api/v1/compliance/status/{id}   │
                        └──────┬───────────┬───────────┘
                 SOAP/XML      │           │ Postgres
                        ┌─────▼────┐  ┌───▼──────┐
                        │Mock SOAP │  │PostgreSQL │
                        │  :8090   │  │  :5432    │
                        └──────────┘  └───────────┘


 Infraestructura adicional:
   MongoDB  :27017  — logs
   MinIO    :9000   — Almacenamiento de archivos
```

## Documentación por servicio
* [MOCK SOAP](/Documentacion/MockSOAP.md)
* [GATEWAY SOAP](/Documentacion/GetwaySOAP.md)
* [Fast API](/Documentacion/FastAPI.md)


## Instrucciones para inicializar
# Docker
Ejecutar el comando: ``` docker-compose up -d ``` para crear el contenedor e imagenes

Una vez ya se tenga el contenedor, utilizar el comando: ``` docker-compose up --build ```

# Postgres
## Configuraciones iniciales posgtres
Ejecuar 
```
docker exec -it postgres_bd psql -U admin -d serviciosfinancieros_db
```

Creación de tablas:
```
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    email TEXT UNIQUE,
    assword TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    filename TEXT,
    status TEXT DEFAULT 'UPLOADED',
    document_type TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);

CREATE TABLE compliance_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL,
    status TEXT,
    details TEXT,
    check_id TEXT,
    document_type TEXT,
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_document
        FOREIGN KEY (document_id)
        REFERENCES documents(id)
        ON DELETE CASCADE
);

```

# MongoDB
Ejecutar
```
docker exec -it mongo_bd  mongosh
```

Creacion de colecciones

```
use servicios_financieros

db.audit_logs.insertOne({
   message: "Documento subido",
   document_id: "1",
   created_at: new Date()
})

db.processing_events.insertOne({
   document_id: "1",
   status: "Procesado",
   timestamp: new Date()
 })
```


# MINIO
Ingresar a: ```http://localhost:9001``` con las credenciales ```admin:admin123```
Crear un Bucket con nomre: ```documentos```