import cv2
import numpy as np
from typing import Dict, List, Optional, Tuple
from PIL import Image
import io
import logging
from datetime import datetime

from config import settings

logger = logging.getLogger(__name__)


class DocumentVerificationService:
    """Service pour la vérification de l'authenticité des documents"""

    def __init__(self):
        """Initialiser le service de vérification de documents"""
        try:
            # Charger les modèles de détection de fraudes
            self._load_fraud_detection_models()

            logger.info("Service de vérification de documents initialisé avec succès")
        except Exception as e:
            logger.error(f"Erreur lors de l'initialisation du service de vérification: {str(e)}")
            raise

    def verify_document(self, image: np.ndarray, document_type: str) -> Dict:
        """
        Vérifier l'authenticité d'un document

        Args:
            image: Image du document en format numpy array
            document_type: Type de document (passport, id_card, driving_license, etc.)

        Returns:
            Dictionnaire contenant les résultats de la vérification
        """
        try:
            verification_results = {
                'document_type': document_type,
                'verification_date': datetime.now().isoformat(),
                'is_authentic': True,
                'confidence': 0.0,
                'checks': {},
            }

            # Effectuer les vérifications spécifiques au type de document
            if document_type == 'passport':
                verification_results['checks'] = self._verify_passport(image)
            elif document_type == 'id_card':
                verification_results['checks'] = self._verify_id_card(image)
            elif document_type == 'driving_license':
                verification_results['checks'] = self._verify_driving_license(image)
            else:
                verification_results['checks'] = self._verify_generic_document(image)

            # Calculer le score de confiance global
            verification_results['confidence'] = self._calculate_confidence(verification_results['checks'])

            # Déterminer si le document est authentique
            verification_results['is_authentic'] = verification_results['confidence'] >= 0.7

            logger.info(f"Vérification de document terminée, confiance: {verification_results['confidence']:.2f}")
            return verification_results

        except Exception as e:
            logger.error(f"Erreur lors de la vérification du document: {str(e)}")
            raise

    def verify_from_file(self, file_bytes: bytes, document_type: str) -> Dict:
        """
        Vérifier l'authenticité d'un document depuis un fichier

        Args:
            file_bytes: Contenu du fichier en bytes
            document_type: Type de document

        Returns:
            Dictionnaire contenant les résultats de la vérification
        """
        try:
            # Charger l'image depuis les bytes
            image = Image.open(io.BytesIO(file_bytes))
            image_np = np.array(image)

            # Convertir en BGR pour OpenCV si nécessaire
            if len(image_np.shape) == 3:
                image_np = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)

            # Vérifier le document
            return self.verify_document(image_np, document_type)

        except Exception as e:
            logger.error(f"Erreur lors de la vérification depuis le fichier: {str(e)}")
            raise

    def detect_document_edges(self, image: np.ndarray) -> Dict:
        """
        Détecter les bords du document

        Args:
            image: Image en format numpy array

        Returns:
            Dictionnaire contenant les coordonnées des bords détectés
        """
        try:
            # Convertir en niveaux de gris
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

            # Appliquer un flou pour réduire le bruit
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)

            # Détecter les bords avec Canny
            edges = cv2.Canny(blurred, 50, 150)

            # Trouver les contours
            contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

            # Trouver le plus grand contour (le document)
            if contours:
                largest_contour = max(contours, key=cv2.contourArea)
                epsilon = 0.02 * cv2.arcLength(largest_contour, True)
                approx = cv2.approxPolyDP(largest_contour, epsilon, True)

                if len(approx) == 4:
                    return {
                        'detected': True,
                        'corners': approx.tolist(),
                        'confidence': 0.9,
                    }

            return {
                'detected': False,
                'corners': None,
                'confidence': 0.0,
            }

        except Exception as e:
            logger.error(f"Erreur lors de la détection des bords: {str(e)}")
            return {
                'detected': False,
                'corners': None,
                'confidence': 0.0,
            }

    def detect_watermarks(self, image: np.ndarray) -> Dict:
        """
        Détecter les filigranes dans le document

        Args:
            image: Image en format numpy array

        Returns:
            Dictionnaire contenant les résultats de la détection de filigranes
        """
        try:
            # Convertir en niveaux de gris
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

            # Appliquer un filtre de seuillage adaptatif
            binary = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)

            # Détecter les contours
            contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

            # Analyser les contours pour trouver des motifs de filigrane
            watermark_detected = False
            watermark_regions = []

            for contour in contours:
                area = cv2.contourArea(contour)
                if 100 < area < 1000:  # Taille typique d'un filigrane
                    x, y, w, h = cv2.boundingRect(contour)
                    watermark_regions.append({
                        'x': int(x),
                        'y': int(y),
                        'width': int(w),
                        'height': int(h),
                    })
                    watermark_detected = True

            return {
                'detected': watermark_detected,
                'regions': watermark_regions,
                'confidence': 0.8 if watermark_detected else 0.0,
            }

        except Exception as e:
            logger.error(f"Erreur lors de la détection des filigranes: {str(e)}")
            return {
                'detected': False,
                'regions': [],
                'confidence': 0.0,
            }

    def detect_tampering(self, image: np.ndarray) -> Dict:
        """
        Détecter les altérations dans le document

        Args:
            image: Image en format numpy array

        Returns:
            Dictionnaire contenant les résultats de la détection d'altérations
        """
        try:
            # Convertir en niveaux de gris
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

            # Calculer l'histogramme
            hist = cv2.calcHist([gray], [0], None, [256], [0, 256])

            # Normaliser l'histogramme
            hist = hist / hist.sum()

            # Détecter les anomalies dans l'histogramme
            anomalies = []
            for i in range(1, 255):
                if abs(hist[i] - hist[i-1]) > 0.01:
                    anomalies.append(i)

            tampering_detected = len(anomalies) > 50

            return {
                'detected': tampering_detected,
                'anomalies': anomalies,
                'confidence': 0.7 if tampering_detected else 0.0,
            }

        except Exception as e:
            logger.error(f"Erreur lors de la détection d'altérations: {str(e)}")
            return {
                'detected': False,
                'anomalies': [],
                'confidence': 0.0,
            }

    def _load_fraud_detection_models(self):
        """Charger les modèles de détection de fraudes"""
        # Dans une implémentation complète, on chargerait ici des modèles pré-entraînés
        # pour détecter les documents falsifiés
        pass

    def _verify_passport(self, image: np.ndarray) -> Dict:
        """Vérifier un passeport"""
        checks = {
            'edges': self.detect_document_edges(image),
            'watermarks': self.detect_watermarks(image),
            'tampering': self.detect_tampering(image),
            'mrz': self._verify_mrz(image),
        }
        return checks

    def _verify_id_card(self, image: np.ndarray) -> Dict:
        """Vérifier une carte d'identité"""
        checks = {
            'edges': self.detect_document_edges(image),
            'watermarks': self.detect_watermarks(image),
            'tampering': self.detect_tampering(image),
            'hologram': self._verify_hologram(image),
        }
        return checks

    def _verify_driving_license(self, image: np.ndarray) -> Dict:
        """Vérifier un permis de conduire"""
        checks = {
            'edges': self.detect_document_edges(image),
            'watermarks': self.detect_watermarks(image),
            'tampering': self.detect_tampering(image),
            'security_features': self._verify_security_features(image),
        }
        return checks

    def _verify_generic_document(self, image: np.ndarray) -> Dict:
        """Vérifier un document générique"""
        checks = {
            'edges': self.detect_document_edges(image),
            'watermarks': self.detect_watermarks(image),
            'tampering': self.detect_tampering(image),
        }
        return checks

    def _verify_mrz(self, image: np.ndarray) -> Dict:
        """Vérifier la zone lisible par machine (MRZ)"""
        try:
            # Convertir en niveaux de gris
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

            # Appliquer un seuillage adaptatif
            binary = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)

            # Chercher la zone MRZ (généralement en bas du document)
            height, width = binary.shape
            mrz_region = binary[int(height * 0.8):, :]

            # Détecter les lignes horizontales
            lines = cv2.HoughLinesP(mrz_region, 1, np.pi/180, threshold=100, minLineLength=width * 0.5, maxLineGap=10)

            mrz_detected = lines is not None and len(lines) >= 2

            return {
                'detected': mrz_detected,
                'confidence': 0.8 if mrz_detected else 0.0,
            }

        except Exception as e:
            logger.error(f"Erreur lors de la vérification de la MRZ: {str(e)}")
            return {
                'detected': False,
                'confidence': 0.0,
            }

    def _verify_hologram(self, image: np.ndarray) -> Dict:
        """Vérifier la présence d'un hologramme"""
        try:
            # Convertir en niveaux de gris
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

            # Appliquer un filtre de Sobel pour détecter les variations d'intensité
            sobel_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
            sobel_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
            sobel = np.sqrt(sobel_x**2 + sobel_y**2)

            # Normaliser
            sobel = cv2.normalize(sobel, None, 0, 255, cv2.NORM_MINMAX, dtype=cv2.CV_8U)

            # Compter les pixels avec forte variation (indicateur d'hologramme)
            hologram_pixels = np.sum(sobel > 100)
            total_pixels = sobel.size
            hologram_ratio = hologram_pixels / total_pixels

            hologram_detected = hologram_ratio > 0.05

            return {
                'detected': hologram_detected,
                'ratio': float(hologram_ratio),
                'confidence': 0.7 if hologram_detected else 0.0,
            }

        except Exception as e:
            logger.error(f"Erreur lors de la vérification de l'hologramme: {str(e)}")
            return {
                'detected': False,
                'ratio': 0.0,
                'confidence': 0.0,
            }

    def _verify_security_features(self, image: np.ndarray) -> Dict:
        """Vérifier les caractéristiques de sécurité"""
        try:
            # Convertir en niveaux de gris
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

            # Détecter les micro-textures
            laplacian = cv2.Laplacian(gray, cv2.CV_64F)
            texture_score = np.mean(np.abs(laplacian))

            # Détecter les motifs de guilloché
            edges = cv2.Canny(gray, 50, 150)
            guilloche_score = np.sum(edges) / edges.size

            security_features_detected = texture_score > 10 and guilloche_score > 0.1

            return {
                'detected': security_features_detected,
                'texture_score': float(texture_score),
                'guilloche_score': float(guilloche_score),
                'confidence': 0.75 if security_features_detected else 0.0,
            }

        except Exception as e:
            logger.error(f"Erreur lors de la vérification des caractéristiques de sécurité: {str(e)}")
            return {
                'detected': False,
                'texture_score': 0.0,
                'guilloche_score': 0.0,
                'confidence': 0.0,
            }

    def _calculate_confidence(self, checks: Dict) -> float:
        """Calculer le score de confiance global"""
        if not checks:
            return 0.0

        # Calculer la moyenne des confiances de toutes les vérifications
        confidences = [check.get('confidence', 0.0) for check in checks.values()]
        return sum(confidences) / len(confidences)


# Instance globale du service de vérification de documents
document_verification_service = DocumentVerificationService()
