export const config = {
  fastapi: {
    baseUrl: process.env.FASTAPI_URL || "http://fastapi:8000",
    endpoints: {
      documents: "/api/v1/documents"
    }
  },
  gateway: {
    baseUrl: process.env.GATEWAY_URL || "http://gateway:8001/",
    endpoints: {
      compliance: "api/v1/compliance/status"
    }
  }
};