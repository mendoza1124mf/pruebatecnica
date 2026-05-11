from flask import Flask, request, Response
import xml.etree.ElementTree as ET
import uuid
from datetime import datetime, timezone
from config import SOAP_NS,COMP_NS
app = Flask(__name__)

COMPORTAMIENTO = {
    "financial_report":      ("COMPLIANT",     "Financial report requerimiento valido"),
    "tax_filing":            ("NON_COMPLIANT", "Tax filing pendiente de observaciones"),
    "regulatory_disclosure": ("COMPLIANT",     "Disclosure requerimiento valido"),
}


def respuesta_exitosa(document_id: str, document_type: str) -> str:
    Status, Details = COMPORTAMIENTO[document_type]

    envelope = ET.Element("soapenv:Envelope", {
        "xmlns:soapenv": SOAP_NS,
        "xmlns:comp":    COMP_NS,
    })

    body = ET.SubElement(envelope, "soapenv:Body")
    VerifyComplianceResponse = ET.SubElement(body, "comp:VerifyComplianceResponse")

    ET.SubElement(VerifyComplianceResponse, "comp:Status").text    = Status
    ET.SubElement(VerifyComplianceResponse, "comp:CheckId").text   = str(uuid.uuid4())
    ET.SubElement(VerifyComplianceResponse, "comp:Details").text   = Details
    ET.SubElement(VerifyComplianceResponse, "comp:CheckedAt").text = datetime.now(timezone.utc).isoformat()

    return '<?xml version="1.0" encoding="UTF-8"?>' + ET.tostring(envelope, encoding="unicode")


def soap_fault(message: str) -> str:
    envelope = ET.Element("soapenv:Envelope", {"xmlns:soapenv": SOAP_NS})
    body  = ET.SubElement(envelope, "soapenv:Body")
    fault = ET.SubElement(body, "soapenv:Fault")

    ET.SubElement(fault, "faultcode").text   = "soapenv:Client"
    ET.SubElement(fault, "faultstring").text = message

    return '<?xml version="1.0" encoding="UTF-8"?>' + ET.tostring(envelope, encoding="unicode")

def parse_request(xml_bytes: bytes) -> tuple[str, str]:
    ns   = {"soapenv": SOAP_NS, "comp": COMP_NS}
    root = ET.fromstring(xml_bytes)

    verify_request = root.find(".//comp:VerifyComplianceRequest", ns)

    document_id   = verify_request.find("comp:DocumentId",   ns).text
    document_type = verify_request.find("comp:DocumentType", ns).text

    return document_id, document_type.lower()

@app.post("/soap/compliance")
def compliance_check():
    try:
        document_id, document_type = parse_request(request.data)
    except Exception:
        xml = soap_fault("request o formato SOAP invalido")
        return Response(xml, status=400, mimetype="text/xml")

    if document_type not in COMPORTAMIENTO:
        xml = soap_fault(f"Tipo de documento desconocido: '{document_type}'. Documentos aceptados: financial_report, tax_filing, regulatory_disclosure")
        return Response(xml, status=500, mimetype="text/xml")


    xml = respuesta_exitosa(document_id, document_type)
    return Response(xml, status=200, mimetype="text/xml")


@app.get("/health")
def health():
    return {"status": "ok", "service": "mock-soap"}, 200


@app.get("/wsdl")
def wsdl():
    wsdl_content = """<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://schemas.xmlsoap.org/wsdl/"
             xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
             xmlns:tns="http://government.example.com/compliance"
             xmlns:xsd="http://www.w3.org/2001/XMLSchema"
             targetNamespace="http://government.example.com/compliance"
             name="ComplianceService">

  <message name="VerifyComplianceRequest">
    <part name="DocumentId"   type="xsd:string"/>
    <part name="DocumentType" type="xsd:string"/>
  </message>

  <message name="VerifyComplianceResponse">
    <part name="Status"    type="xsd:string"/>
    <part name="CheckId"   type="xsd:string"/>
    <part name="Details"   type="xsd:string"/>
    <part name="CheckedAt" type="xsd:string"/>
  </message>

  <portType name="CompliancePortType">
    <operation name="VerifyCompliance">
      <input  message="tns:VerifyComplianceRequest"/>
      <output message="tns:VerifyComplianceResponse"/>
    </operation>
  </portType>

  <binding name="ComplianceBinding" type="tns:CompliancePortType">
    <soap:binding style="rpc" transport="http://schemas.xmlsoap.org/soap/http"/>
    <operation name="VerifyCompliance">
        <soap:operation soapAction="VerifyCompliance" style="rpc"/>
        <input>
            <soap:body use="literal"/>
        </input>
        <output>
            <soap:body use="literal"/>
        </output>
    </operation>
  </binding>

  <service name="ComplianceService">
    <port name="CompliancePort" binding="tns:ComplianceBinding">
      <soap:address location="http://mock_soap:8090/soap/compliance"/>
    </port>
  </service>

</definitions>"""
    return Response(wsdl_content, mimetype="text/xml")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8090, debug=True)