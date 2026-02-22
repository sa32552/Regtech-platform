from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import logging
import uvicorn

from config import settings
from services.ocr_service import ocr_service
from services.nlp_service import nlp_service
from services.ner_service import ner_service
from services.document_verification_service import DocumentVerificationService

# Configuration du logging
logging.basicConfig(
    level=settings.LOG_LEVEL,
    format=settings.LOG_FORMAT,
)
logger = logging.getLogger(__name__)

# Initialiser FastAPI
app = FastAPI(
    title="RegTech AI Service",
    description="Service IA pour la conformité réglementaire (OCR, NLP, NER, Vérification de documents)",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sécurité
security = HTTPBearer()

# Initialiser les services
doc_verification_service = DocumentVerificationService()

# Modèles Pydantic
class TextAnalysisRequest(BaseModel):
    text: str
    extract_risk_indicators: Optional[bool] = False

class DocumentVerificationRequest(BaseModel):
    document_type: str

class DocumentComparisonRequest(BaseModel):
    text1: str
    text2: str

class HealthResponse(BaseModel):
    status: str
    services: Dict[str, str]

# Dépendances
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> bool:
    """Vérifier le token d'authentification"""
    if settings.BACKEND_API_KEY:
        token = credentials.credentials
        if token != settings.BACKEND_API_KEY:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token invalide"
            )
    return True

# Routes de santé
@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Vérifier la santé du service"""
    return {
        "status": "healthy",
        "services": {
            "ocr": "operational",
            "nlp": "operational",
            "ner": "operational",
            "document_verification": "operational",
        }
    }

# Routes OCR
@app.post("/api/v1/ocr/extract-text", tags=["OCR"])
async def extract_text_from_image(
    file: UploadFile = File(...),
    auth: bool = Depends(verify_token)
):
    """Extraire le texte d'une image"""
    try:
        # Vérifier le type de fichier
        if file.content_type not in settings.ALLOWED_FILE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Type de fichier non supporté. Types acceptés: {settings.ALLOWED_FILE_TYPES}"
            )

        # Lire le fichier
        file_bytes = await file.read()

        # Extraire le texte
        result = ocr_service.extract_from_file(file_bytes)

        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        logger.error(f"Erreur lors de l'extraction de texte: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.post("/api/v1/ocr/extract-document-data", tags=["OCR"])
async def extract_document_data(
    file: UploadFile = File(...),
    auth: bool = Depends(verify_token)
):
    """Extraire les données structurées d'un document"""
    try:
        # Vérifier le type de fichier
        if file.content_type not in settings.ALLOWED_FILE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Type de fichier non supporté. Types acceptés: {settings.ALLOWED_FILE_TYPES}"
            )

        # Lire le fichier
        file_bytes = await file.read()

        # Extraire les données
        result = ocr_service.extract_from_file(file_bytes)

        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        logger.error(f"Erreur lors de l'extraction de données: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# Routes NLP
@app.post("/api/v1/nlp/analyze", tags=["NLP"])
async def analyze_text(
    request: TextAnalysisRequest,
    auth: bool = Depends(verify_token)
):
    """Analyser un texte"""
    try:
        result = nlp_service.analyze_text(request.text)

        if request.extract_risk_indicators:
            result['risk_indicators'] = nlp_service.extract_risk_indicators(request.text)

        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        logger.error(f"Erreur lors de l'analyse NLP: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.post("/api/v1/nlp/compare-documents", tags=["NLP"])
async def compare_documents(
    request: DocumentComparisonRequest,
    auth: bool = Depends(verify_token)
):
    """Comparer deux documents"""
    try:
        result = nlp_service.compare_documents(request.text1, request.text2)

        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        logger.error(f"Erreur lors de la comparaison de documents: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# Routes NER
@app.post("/api/v1/ner/extract-entities", tags=["NER"])
async def extract_entities(
    request: TextAnalysisRequest,
    auth: bool = Depends(verify_token)
):
    """Extraire les entités nommées d'un texte"""
    try:
        result = ner_service.extract_entities(request.text)

        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        logger.error(f"Erreur lors de l'extraction d'entités: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.post("/api/v1/ner/extract-kyc-entities", tags=["NER"])
async def extract_kyc_entities(
    request: TextAnalysisRequest,
    auth: bool = Depends(verify_token)
):
    """Extraire les entités KYC d'un texte"""
    try:
        result = ner_service.extract_kyc_entities(request.text)

        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        logger.error(f"Erreur lors de l'extraction d'entités KYC: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.post("/api/v1/ner/extract-aml-entities", tags=["NER"])
async def extract_aml_entities(
    request: TextAnalysisRequest,
    auth: bool = Depends(verify_token)
):
    """Extraire les entités AML d'un texte"""
    try:
        result = ner_service.extract_aml_entities(request.text)

        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        logger.error(f"Erreur lors de l'extraction d'entités AML: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# Routes Vérification de documents
@app.post("/api/v1/document/verify", tags=["Document Verification"])
async def verify_document(
    file: UploadFile = File(...),
    document_type: str = "generic",
    auth: bool = Depends(verify_token)
):
    """Vérifier l'authenticité d'un document"""
    try:
        # Vérifier le type de fichier
        if file.content_type not in settings.ALLOWED_FILE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Type de fichier non supporté. Types acceptés: {settings.ALLOWED_FILE_TYPES}"
            )

        # Lire le fichier
        file_bytes = await file.read()

        # Vérifier le document
        result = doc_verification_service.verify_from_file(file_bytes, document_type)

        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        logger.error(f"Erreur lors de la vérification du document: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.post("/api/v1/document/detect-edges", tags=["Document Verification"])
async def detect_document_edges(
    file: UploadFile = File(...),
    auth: bool = Depends(verify_token)
):
    """Détecter les bords d'un document"""
    try:
        # Vérifier le type de fichier
        if file.content_type not in settings.ALLOWED_FILE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Type de fichier non supporté. Types acceptés: {settings.ALLOWED_FILE_TYPES}"
            )

        # Lire le fichier
        file_bytes = await file.read()

        # Charger l'image
        from PIL import Image
        import numpy as np
        image = Image.open(io.BytesIO(file_bytes))
        image_np = np.array(image)

        # Détecter les bords
        result = doc_verification_service.detect_document_edges(image_np)

        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        logger.error(f"Erreur lors de la détection des bords: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# Point d'entrée
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=True,
        log_level=settings.LOG_LEVEL.lower(),
    )
