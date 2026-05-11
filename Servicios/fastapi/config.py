import os

SOAP_GATEWAY = os.getenv("SOAP_GATEWAY", "http://gateway:8001/api/v1/compliance/check")

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://admin:admin@postgres:5432/serviciosfinancieros_db",
)

MINIO_ENDPOINT   = os.getenv("MINIO_ENDPOINT",   "minio:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "admin")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "admin123")
MINIO_BUCKET     = os.getenv("MINIO_BUCKET",     "documentos")

