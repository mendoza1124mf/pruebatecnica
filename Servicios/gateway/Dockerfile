FROM python:3.13-slim

WORKDIR /gateway

COPY requerimientos.txt .

RUN pip install --no-cache-dir -r requerimientos.txt

COPY . .

CMD ["python", "gateway_soap.py"]