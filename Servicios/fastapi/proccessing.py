import uuid
import httpx
import psycopg2
import psycopg2.extras
from minio import Minio
from io import BytesIO

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query
from fastapi.responses import JSONResponse
from config import MINIO_BUCKET, MINIO_ENDPOINT, MINIO_ACCESS_KEY,MINIO_SECRET_KEY, SOAP_GATEWAY, DATABASE_URL

minio_client = Minio(
    MINIO_ENDPOINT,
    access_key=MINIO_ACCESS_KEY,
    secret_key=MINIO_SECRET_KEY,
    secure=False,
)

app = FastAPI(title="FastAPI Document Processing", version="1.0.0")

@app.post("/api/v1/documents/upload", status_code=201)
async def subir_documento(
    file:          UploadFile = File(...),
    user_id:       str        = Form(...),
    document_type: str        = Form(...),
):
    content = await file.read()

    document_id = str(uuid.uuid4())
    minio_key   = f"{document_id}/{file.filename}"

    minio_client.put_object(
        bucket_name  = MINIO_BUCKET,
        object_name  = minio_key,
        data         = BytesIO(content),
        length       = len(content),
        content_type = file.content_type or "application/octet-stream",
    )

    
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=psycopg2.extras.RealDictCursor)
    with conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO documents (id, user_id, filename, document_type)
                VALUES (%s, %s, %s, %s)
                RETURNING id, user_id, filename, status, created_at, document_type
            """, ( document_id, user_id, file.filename, document_type))
            row = dict(cur.fetchone())
        conn.commit()

    row["id"]         = str(row["id"])
    row["user_id"]    = str(row["user_id"])
    row["created_at"] = row["created_at"].isoformat()
    conn.close()

    return JSONResponse(content=row, status_code=201)

@app.get("/api/v1/documents")
def paginacion(
    page:      int = Query(default=1,  ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
):
    offset = (page - 1) * page_size

    conn = psycopg2.connect(DATABASE_URL, cursor_factory=psycopg2.extras.RealDictCursor)
    with conn:
        with conn.cursor() as cur:

            cur.execute("SELECT COUNT(*) AS total FROM documents")
            total = cur.fetchone()["total"]

            cur.execute("""
                SELECT id, user_id, filename, status, created_at, document_type
                FROM   documents
                ORDER  BY created_at DESC
                LIMIT  %s OFFSET %s
            """, (page_size, offset))
            rows = cur.fetchall()

    items = []
    for row in rows:
        r = dict(row)
        r["id"]          = str(r["id"])
        r["created_at"] = r["created_at"].isoformat()
        items.append(r)
    conn.close()

    return {
        "page":       page,
        "page_size":  page_size,
        "total":      total,
        "total_pages": -(-total // page_size), 
        "items":      items,
    }


@app.post("/api/v1/documents/{document_id}/process")
async def process_document(document_id: str):

    conn = psycopg2.connect(DATABASE_URL, cursor_factory=psycopg2.extras.RealDictCursor)
    with conn:
        with conn.cursor() as curs:
            curs.execute("""
                SELECT id, filename, status, document_type
                FROM   documents
                WHERE  id = %s
            """, (document_id,))
            row = curs.fetchone()

    if row is None:
        raise HTTPException(status_code=404, detail=f"Documento '{document_id}' no encontrado")
    conn.close()

    async with httpx.AsyncClient(timeout=15) as client:
        try:
            response = await client.post(
                SOAP_GATEWAY,
                json={
                    "DocumentId":   document_id,
                    "DocumentType": row["document_type"],
                },
            )
            response.raise_for_status()
            compliance_result = response.json()

        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=502,
                detail=f"SOAP Gateway error: {e.response.text}",
            )
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=503,
                detail=f"SOAP Gateway unreachable: {str(e)}",
            )
        
    conn = psycopg2.connect(DATABASE_URL)
    with conn:
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE documents SET status = 'Processed' WHERE id = %s
            """, (document_id,))
        conn.commit()
    conn.close()

    return {
        "document_id":  document_id,
        "compliance":   compliance_result,
    }

@app.get("/health")
def health():
    return {"status": "ok", "service": "fastapi"}



