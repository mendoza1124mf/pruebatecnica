import os

SOAP_NS = "http://schemas.xmlsoap.org/soap/envelope/"
COMP_NS = "http://government.example.com/compliance"

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://admin:admin@postgres:5432/serviciosfinancieros_db",
)