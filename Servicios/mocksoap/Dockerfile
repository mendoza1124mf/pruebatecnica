FROM python:3.13-slim

WORKDIR /mocksoap

COPY requerimientos.txt .

RUN pip install --no-cache-dir -r requerimientos.txt

COPY . .

CMD ["python", "mock.py"]