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
[MOCK SOAP](/Documentacion/MockSOAP.md)
[GATEWAY SOAP](/Documentacion/GetwaySOAP.md)


## Instrucciones para inicializar
# Docker
Ejecutar el comando: docker-compose up -d para crear el contenedor e imagenes

Una vez ya se tenga el contenedor, utilizar el comando: docker-compose up --build 

