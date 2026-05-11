FROM python:3.13-slim

WORKDIR /fastapi

COPY requerimientos.txt .

RUN pip install --no-cache-dir -r requerimientos.txt

COPY . .

CMD ["uvicorn", "proccessing:app", "--host", "0.0.0.0", "--port", "8000"]