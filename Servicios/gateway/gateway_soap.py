import os
import uuid
import datetime
import xml.etree.ElementTree as ET

import requests
import psycopg2
import psycopg2.extras
from flask import Flask, request, jsonify
from config import DATABASE_URL, SOAP_NS, COMP_NS

app = Flask(__name__)


def llamar_mock(DocumentId: str, DocumentType: str)-> dict:
    request_xml = f"""<?xml version="1.0" encoding="UTF-8"?>
    <soapenv:Envelope xmlns:soapenv="{SOAP_NS}" xmlns:comp="{COMP_NS}">
        <soapenv:Body>
            <comp:VerifyComplianceRequest>
                <comp:DocumentId>{DocumentId}</comp:DocumentId>
                <comp:DocumentType>{DocumentType}</comp:DocumentType>
            </comp:VerifyComplianceRequest>
        </soapenv:Body>
    </soapenv:Envelope>"""
    
    response = requests.post(
        "http://mock_soap:8090/soap/compliance",
        data=request_xml.encode("utf-8"),
        headers={"Content-Type": "text/xml; charset=utf-8"},
        timeout=10,
    )

    ns   = {"soapenv": SOAP_NS, "comp": COMP_NS}
    root = ET.fromstring(response.text)
    resp = root.find(".//comp:VerifyComplianceResponse", ns)

    fault = root.find(".//soapenv:Fault", ns)
    if fault is not None:
        faultstring = fault.find("faultstring").text
        raise ValueError(f"SOAP Fault: {faultstring}")

    return {
        "Status":    resp.find("comp:Status",    ns).text,
        "CheckId":   resp.find("comp:CheckId",   ns).text,
        "Details":   resp.find("comp:Details",   ns).text,
        "CheckedAt": resp.find("comp:CheckedAt", ns).text,
    }

def guardar(DocumentId: str, DocumentType: str, respuesta_soap: dict):
    conn = psycopg2.connect(DATABASE_URL)
    with conn:
        with conn.cursor() as curs:
            curs.execute("""
                INSERT INTO compliance_checks
                    (id, document_id, status, document_type, check_id, details, checked_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, 
            (
                str(uuid.uuid4()),
                DocumentId,
                respuesta_soap["Status"],
                DocumentType,
                respuesta_soap["CheckId"],
                respuesta_soap["Details"],
                respuesta_soap["CheckedAt"],
            ))
    conn.close()
    
@app.post("/api/v1/compliance/check")
def compliance_check():
    
    body          = request.get_json()
    DocumentId   = body["DocumentId"]
    DocumentType = body["DocumentType"]

    try:
        respuesta_soap = llamar_mock(DocumentId, DocumentType)   
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"Error al llamar mock service": str(e)}), 422

    guardar(DocumentId, DocumentType, respuesta_soap)  

    return jsonify(respuesta_soap), 200



@app.get("/api/v1/compliance/status/<DocumentId>")
def compliance_status(DocumentId: str):
    conn = psycopg2.connect(DATABASE_URL)
    with conn.cursor() as cur:
        cur.execute("""
            SELECT status, check_id, details, checked_at
            FROM   compliance_checks
            WHERE  document_id = %s
            ORDER  BY checked_at DESC
            LIMIT  1
        """, (DocumentId,))
        row = cur.fetchone()
    conn.close()

    if not row:
        return jsonify({"error": "No encontrado"}), 404

    return jsonify({
        "document_id": DocumentId,
        "status":      row[0],
        "check_id":    str(row[1]),
        "details":     row[2],
        "checked_at":  str(row[3]),
    }), 200


@app.get("/health")
def health():
    return jsonify({"status": "ok", "service": "soap-gateway"}), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8001, debug=True)