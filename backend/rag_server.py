# """
# CaseMinds RAG Server
# Connects React frontend to Claude AI with evidence context
# Run with: uvicorn rag_server:app --reload --port 8000
# """

# from urllib import response

# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# import requests
# import json
# import os

# from dotenv import load_dotenv
# import os

# load_dotenv()

# AGENTROUTER_API_KEY = os.getenv("AGENTROUTER_API_KEY", "sk-YQWXlPlnkB1lYfjEvcixMJ8yzWycENlPt7YSEXaFno9U5Egw")
# AGENTROUTER_BASE_URL = os.getenv("AGENTROUTER_BASE_URL", "https://agentrouter.org")
# AGENTROUTER_MODEL = os.getenv("AGENTROUTER_MODEL", "claude-opus-4-6")

# app = FastAPI(title="CaseMinds RAG Server")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:5173"],
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Load evidence from sample data files
# def load_evidence():
#     evidence = {}
    
#     base = "C:/Users/ACER/Caseminds/sample_data"
    
#     try:
#         with open(f"{base}/chat_export.json") as f:
#             chat = json.load(f)
#             messages = chat.get("messages", [])
#             evidence["chat"] = "\n".join([
#                 f"[{m['timestamp']}] {m['from']} → {m['to']}: {m['content']}"
#                 for m in messages
#             ])
#     except Exception as e:
#         evidence["chat"] = "Chat data unavailable"

#     try:
#         with open(f"{base}/call_records.csv") as f:
#             evidence["calls"] = f.read()
#     except:
#         evidence["calls"] = "Call records unavailable"

#     try:
#         with open(f"{base}/metadata_sample.json") as f:
#             meta = json.load(f)
#             files = meta.get("files", [])
#             evidence["metadata"] = "\n".join([
#                 f"{fi['file']}: GPS={fi.get('gps_lat','NO GPS')},{fi.get('gps_lng','')}, "
#                 f"Captured={fi.get('datetime_original','')}, "
#                 f"Device={fi.get('make','')} {fi.get('model','')}, "
#                 f"Notes={fi.get('_analysis','')}"
#                 for fi in files
#             ])
#     except:
#         evidence["metadata"] = "Metadata unavailable"

#     return evidence

# EVIDENCE = load_evidence()

# EVIDENCE_CONTEXT = f"""
# CASE: Operation Shield (KL-DEMO-2024-001)
# SUSPECT: Accused_X | Phone: 9876543210

# CHAT EVIDENCE (chat_export.json):
# {EVIDENCE['chat']}

# CALL RECORDS (call_records.csv):
# {EVIDENCE['calls']}

# METADATA (metadata_sample.json):
# {EVIDENCE['metadata']}

# TIMELINE GAP: Mar 12 20:02 to Mar 13 02:14 = 6h 12min SUSPICIOUS SILENCE

# GROOMING SIGNALS: SECRECY_INDUCTION, PHYSICAL_MEETING_PROPOSED,
# PLATFORM_MIGRATION, DELETED_MESSAGE_GHOST, VICTIM_LATENCY_DROP

# RISK SCORES: Active Risk=91/100, Case Risk=77/100, Net Confidence=34.1/100
# """

# class Query(BaseModel):
#     question: str
#     case_id: str = "KL-DEMO-2024-001"


# @app.get("/")
# def root():
#     return {"status": "CaseMinds RAG Server running"}

# @app.post("/api/query")
# async def query_evidence(query: Query):
    
#     system_prompt = """You are CaseMinds Evidence Copilot for Kerala Police.

# Answer questions about case evidence. You support Malayalam and English.
# Detect which language the question is in and respond in the SAME language.
# If the question is in Malayalam or Manglish, answer in Malayalam.
# If the question is in English, answer in English.

# Always cite your sources: chat_export.json, call_records.csv, metadata_sample.json.
# Never speculate beyond what the evidence shows.
# Keep answers under 120 words.
# Format: direct answer first, then cite the source."""

#     headers = {
#     "Content-Type": "application/json",
#     "x-api-key": AGENTROUTER_API_KEY,
#     "anthropic-version": "2023-06-01"
#     }

#     payload = {
#         "model": "claude-sonnet-4-6",
#         "max_tokens": 400,
#         "system": system_prompt,
#         "messages": [
#             {
#                 "role": "user",
#                 "content": f"Evidence:\n{EVIDENCE_CONTEXT}\n\nInvestigator question: {req.question}"
#             }
#         ]
#     }

#     response = requests.post(
#     f"{AGENTROUTER_BASE_URL}/v1/messages",
#     headers=headers,
#     json=payload,
#     timeout=30
# )
# data = response.json()
# answer = data["content"][0]["text"]

#     return {
#     "answer": answer,
#     "sources": ["chat_export.json", "call_records.csv", "metadata_sample.json"],
#     "case_id": req.case_id,
#     "status": "success",
#     "model": AGENTROUTER_MODEL
# }

# @app.get("/api/health")
# def health():
#     return {
#         "status": "healthy",
#         "evidence_loaded": bool(EVIDENCE),
#         "chat_messages": EVIDENCE['chat'].count('\n') + 1
#     }