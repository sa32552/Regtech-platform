import os
import cv2
import numpy as np
from paddleocr import PaddleOCR
from typing import Dict, List, Optional, Tuple
from PIL import Image
import io
import logging

from config import settings

logger = logging.getLogger(__name__)


class OCRService:
    """Service OCR pour l'extraction de texte et de données des documents"""

    def __init__(self):
        """Initialiser le service OCR avec PaddleOCR"""
        try:
            # Initialiser PaddleOCR avec le modèle français
            self.ocr = PaddleOCR(
                use_angle_cls=True,
                lang='fr',
                use_gpu=False,  # Mettre à True si GPU disponible
                show_log=False,
            )
            logger.info("Service OCR initialisé avec succès")
        except Exception as e:
            logger.error(f"Erreur lors de l'initialisation du service OCR: {str(e)}")
            raise

    def extract_text(self, image: np.ndarray) -> List[Dict]:
        """
        Extraire le texte d'une image

        Args:
            image: Image en format numpy array

        Returns:
            Liste des résultats OCR avec coordonnées et texte
        """
        try:
            result = self.ocr.ocr(image, cls=True)

            if not result or not result[0]:
                return []

            # Formater les résultats
            formatted_results = []
            for line in result[0]:
                bbox = line[0]
                text_info = line[1]
                text = text_info[0]
                confidence = text_info[1]

                formatted_results.append({
                    'text': text,
                    'confidence': float(confidence),
                    'bbox': bbox,
                    'type': self._detect_text_type(text),
                })

            logger.info(f"Extraction de texte réussie: {len(formatted_results)} lignes détectées")
            return formatted_results

        except Exception as e:
            logger.error(f"Erreur lors de l'extraction de texte: {str(e)}")
            raise

    def extract_document_data(self, image: np.ndarray) -> Dict:
        """
        Extraire les données structurées d'un document

        Args:
            image: Image en format numpy array

        Returns:
            Dictionnaire contenant les données extraites
        """
        try:
            # Extraire tout le texte
            ocr_results = self.extract_text(image)
            full_text = ' '.join([r['text'] for r in ocr_results])

            # Analyser le texte pour extraire les données structurées
            document_data = {
                'full_text': full_text,
                'lines': ocr_results,
                'document_type': self._detect_document_type(full_text),
                'extracted_fields': self._extract_fields(full_text, ocr_results),
            }

            logger.info(f"Extraction de données réussie pour document de type: {document_data['document_type']}")
            return document_data

        except Exception as e:
            logger.error(f"Erreur lors de l'extraction de données: {str(e)}")
            raise

    def extract_from_file(self, file_bytes: bytes) -> Dict:
        """
        Extraire les données d'un fichier

        Args:
            file_bytes: Contenu du fichier en bytes

        Returns:
            Dictionnaire contenant les données extraites
        """
        try:
            # Charger l'image depuis les bytes
            image = Image.open(io.BytesIO(file_bytes))
            image_np = np.array(image)

            # Convertir en BGR pour OpenCV si nécessaire
            if len(image_np.shape) == 3:
                image_np = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)

            # Extraire les données
            return self.extract_document_data(image_np)

        except Exception as e:
            logger.error(f"Erreur lors de l'extraction depuis le fichier: {str(e)}")
            raise

    def _detect_text_type(self, text: str) -> str:
        """
        Détecter le type de texte (numérique, alphabétique, mixte)

        Args:
            text: Texte à analyser

        Returns:
            Type de texte détecté
        """
        if text.isdigit():
            return 'numeric'
        elif text.isalpha():
            return 'alpha'
        else:
            return 'mixed'

    def _detect_document_type(self, text: str) -> str:
        """
        Détecter le type de document

        Args:
            text: Texte complet du document

        Returns:
            Type de document détecté
        """
        text_lower = text.lower()

        # Mots-clés pour différents types de documents
        document_keywords = {
            'passport': ['passeport', 'passport', 'république'],
            'id_card': ['carte d'identité', 'carte d identité', 'id card'],
            'driving_license': ['permis de conduire', 'permis de conduire', 'driving license'],
            'residence_proof': ['justificatif de domicile', 'justificatif de domicile', 'facture'],
            'bank_statement': ['relevé bancaire', 'relevé bancaire', 'bank statement'],
            'tax_return': ['déclaration d'impôts', 'déclaration d impôts', 'tax return'],
        }

        # Chercher des correspondances
        for doc_type, keywords in document_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                return doc_type

        return 'unknown'

    def _extract_fields(self, full_text: str, ocr_results: List[Dict]) -> Dict:
        """
        Extraire les champs spécifiques du document

        Args:
            full_text: Texte complet du document
            ocr_results: Résultats OCR détaillés

        Returns:
            Dictionnaire des champs extraits
        """
        fields = {}

        # Extraire les dates (format JJ/MM/AAAA ou JJ-MM-AAAA)
        import re
        dates = re.findall(r'(\d{2}[/\-]\d{2}[/\-]\d{4})', full_text)
        if dates:
            fields['dates'] = dates

        # Extraire les numéros (séquences de chiffres)
        numbers = re.findall(r'(\d{6,})', full_text)
        if numbers:
            fields['numbers'] = numbers

        # Extraire les emails
        emails = re.findall(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}', full_text)
        if emails:
            fields['emails'] = emails

        # Extraire les montants (avec devise)
        amounts = re.findall(r'(\d+[.,]\d{2}\s*(?:EUR|€|\$|USD))', full_text)
        if amounts:
            fields['amounts'] = amounts

        return fields


# Instance globale du service OCR
ocr_service = OCRService()
