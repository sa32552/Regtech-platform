import spacy
from typing import Dict, List, Optional
import logging
from collections import Counter
import re

from config import settings

logger = logging.getLogger(__name__)


class NLPService:
    """Service NLP pour l'analyse de texte et la détection de sentiments"""

    def __init__(self):
        """Initialiser le service NLP avec Spacy"""
        try:
            # Charger le modèle Spacy français
            self.nlp = spacy.load(settings.SPACY_MODEL)
            logger.info(f"Service NLP initialisé avec le modèle {settings.SPACY_MODEL}")
        except Exception as e:
            logger.error(f"Erreur lors de l'initialisation du service NLP: {str(e)}")
            logger.info("Téléchargement du modèle Spacy...")
            try:
                import subprocess
                subprocess.run(["python", "-m", "spacy", "download", settings.SPACY_MODEL], check=True)
                self.nlp = spacy.load(settings.SPACY_MODEL)
                logger.info(f"Service NLP initialisé avec succès après téléchargement")
            except Exception as download_error:
                logger.error(f"Erreur lors du téléchargement du modèle: {str(download_error)}")
                raise

    def analyze_text(self, text: str) -> Dict:
        """
        Analyser un texte et extraire des informations

        Args:
            text: Texte à analyser

        Returns:
            Dictionnaire contenant les résultats de l'analyse
        """
        try:
            doc = self.nlp(text)

            analysis = {
                'language': self._detect_language(doc),
                'sentiment': self._analyze_sentiment(doc),
                'keywords': self._extract_keywords(doc),
                'entities': self._extract_entities(doc),
                'phrases': self._extract_phrases(doc),
                'statistics': self._compute_statistics(doc),
            }

            logger.info(f"Analyse NLP réussie pour texte de {len(text)} caractères")
            return analysis

        except Exception as e:
            logger.error(f"Erreur lors de l'analyse NLP: {str(e)}")
            raise

    def extract_risk_indicators(self, text: str) -> Dict:
        """
        Extraire les indicateurs de risque d'un texte

        Args:
            text: Texte à analyser

        Returns:
            Dictionnaire contenant les indicateurs de risque
        """
        try:
            doc = self.nlp(text)

            risk_indicators = {
                'suspicious_keywords': self._find_suspicious_keywords(doc),
                'money_laundering_terms': self._find_money_laundering_terms(doc),
                'terrorist_finance_terms': self._find_terrorist_finance_terms(doc),
                'sanctions_terms': self._find_sanctions_terms(doc),
                'risk_score': 0,
            }

            # Calculer le score de risque global
            risk_indicators['risk_score'] = self._calculate_risk_score(risk_indicators)

            logger.info(f"Extraction d'indicateurs de risque réussie, score: {risk_indicators['risk_score']}")
            return risk_indicators

        except Exception as e:
            logger.error(f"Erreur lors de l'extraction des indicateurs de risque: {str(e)}")
            raise

    def compare_documents(self, text1: str, text2: str) -> Dict:
        """
        Comparer deux documents et trouver les similarités

        Args:
            text1: Premier texte
            text2: Deuxième texte

        Returns:
            Dictionnaire contenant les résultats de la comparaison
        """
        try:
            doc1 = self.nlp(text1)
            doc2 = self.nlp(text2)

            comparison = {
                'similarity': doc1.similarity(doc2),
                'common_keywords': self._find_common_keywords(doc1, doc2),
                'common_entities': self._find_common_entities(doc1, doc2),
                'differences': self._find_differences(doc1, doc2),
            }

            logger.info(f"Comparaison de documents réussie, similarité: {comparison['similarity']:.2f}")
            return comparison

        except Exception as e:
            logger.error(f"Erreur lors de la comparaison des documents: {str(e)}")
            raise

    def _detect_language(self, doc) -> str:
        """Détecter la langue du texte"""
        return doc.lang_

    def _analyze_sentiment(self, doc) -> Dict:
        """Analyser le sentiment du texte"""
        # Pour l'instant, une analyse simple basée sur les mots positifs/négatifs
        # Dans une version complète, on utiliserait un modèle de sentiment

        positive_words = {'bon', 'excellent', 'positif', 'favorable', 'satisfaisant'}
        negative_words = {'mauvais', 'négatif', 'défavorable', 'problème', 'erreur', 'risque'}

        positive_count = sum(1 for token in doc if token.text.lower() in positive_words)
        negative_count = sum(1 for token in doc if token.text.lower() in negative_words)

        total = positive_count + negative_count
        if total == 0:
            sentiment = 'neutral'
            confidence = 0.5
        elif positive_count > negative_count:
            sentiment = 'positive'
            confidence = positive_count / total
        else:
            sentiment = 'negative'
            confidence = negative_count / total

        return {
            'sentiment': sentiment,
            'confidence': confidence,
            'positive_count': positive_count,
            'negative_count': negative_count,
        }

    def _extract_keywords(self, doc, top_n: int = 10) -> List[Dict]:
        """Extraire les mots-clés les plus importants"""
        # Filtrer les stopwords et la ponctuation
        words = [
            token.lemma_.lower() 
            for token in doc 
            if not token.is_stop and not token.is_punct and token.is_alpha
        ]

        # Compter la fréquence
        word_counts = Counter(words)

        # Retourner les top_n mots les plus fréquents
        return [
            {'word': word, 'count': count}
            for word, count in word_counts.most_common(top_n)
        ]

    def _extract_entities(self, doc) -> List[Dict]:
        """Extraire les entités nommées"""
        return [
            {
                'text': ent.text,
                'label': ent.label_,
                'start': ent.start_char,
                'end': ent.end_char,
                'description': spacy.explain(ent.label_),
            }
            for ent in doc.ents
        ]

    def _extract_phrases(self, doc) -> List[str]:
        """Extraire les phrases importantes"""
        return [sent.text.strip() for sent in doc.sents]

    def _compute_statistics(self, doc) -> Dict:
        """Calculer les statistiques du texte"""
        return {
            'tokens': len(doc),
            'words': len([token for token in doc if token.is_alpha]),
            'sentences': len(list(doc.sents)),
            'paragraphs': len([p for p in doc.text.split('

') if p.strip()]),
            'avg_sentence_length': sum(len(sent) for sent in doc.sents) / len(list(doc.sents)) if len(list(doc.sents)) > 0 else 0,
        }

    def _find_suspicious_keywords(self, doc) -> List[str]:
        """Trouver les mots-clés suspects"""
        suspicious_keywords = {
            'argent', 'cash', 'liquide', 'secret', 'caché', 'offshore',
            'paradis fiscal', 'évasion', 'fraude', 'blanchiment', 'lavage',
        }

        return [
            token.text.lower()
            for token in doc
            if token.text.lower() in suspicious_keywords
        ]

    def _find_money_laundering_terms(self, doc) -> List[str]:
        """Trouver les termes liés au blanchiment d'argent"""
        ml_terms = {
            'blanchiment', 'lavage', 'argent', 'cash', 'liquide',
            'transfert', 'mouvement', 'compte', 'banque',
        }

        return [
            token.text.lower()
            for token in doc
            if token.text.lower() in ml_terms
        ]

    def _find_terrorist_finance_terms(self, doc) -> List[str]:
        """Trouver les termes liés au financement du terrorisme"""
        tf_terms = {
            'terroriste', 'terrorisme', 'financement', 'financer',
            'organisation', 'groupe', 'cellule', 'réseau',
        }

        return [
            token.text.lower()
            for token in doc
            if token.text.lower() in tf_terms
        ]

    def _find_sanctions_terms(self, doc) -> List[str]:
        """Trouver les termes liés aux sanctions"""
        sanctions_terms = {
            'sanction', 'embargo', 'liste', 'interdit', 'bloqué',
            'gel', 'actifs', 'ressources',
        }

        return [
            token.text.lower()
            for token in doc
            if token.text.lower() in sanctions_terms
        ]

    def _calculate_risk_score(self, risk_indicators: Dict) -> float:
        """Calculer le score de risque global"""
        score = 0

        # Ponderer chaque type d'indicateur
        score += len(risk_indicators['suspicious_keywords']) * 2
        score += len(risk_indicators['money_laundering_terms']) * 3
        score += len(risk_indicators['terrorist_finance_terms']) * 5
        score += len(risk_indicators['sanctions_terms']) * 4

        # Normaliser entre 0 et 100
        max_score = 50  # Score maximum possible
        normalized_score = min(score / max_score * 100, 100)

        return round(normalized_score, 2)

    def _find_common_keywords(self, doc1, doc2) -> List[str]:
        """Trouver les mots-clés communs entre deux documents"""
        keywords1 = {token.lemma_.lower() for token in doc1 if not token.is_stop and not token.is_punct and token.is_alpha}
        keywords2 = {token.lemma_.lower() for token in doc2 if not token.is_stop and not token.is_punct and token.is_alpha}

        return list(keywords1 & keywords2)

    def _find_common_entities(self, doc1, doc2) -> List[Dict]:
        """Trouver les entités communes entre deux documents"""
        entities1 = {ent.text.lower(): ent.label_ for ent in doc1.ents}
        entities2 = {ent.text.lower(): ent.label_ for ent in doc2.ents}

        common = []
        for entity, label in entities1.items():
            if entity in entities2 and entities2[entity] == label:
                common.append({
                    'text': entity,
                    'label': label,
                })

        return common

    def _find_differences(self, doc1, doc2) -> Dict:
        """Trouver les différences entre deux documents"""
        keywords1 = {token.lemma_.lower() for token in doc1 if not token.is_stop and not token.is_punct and token.is_alpha}
        keywords2 = {token.lemma_.lower() for token in doc2 if not token.is_stop and not token.is_punct and token.is_alpha}

        return {
            'unique_in_doc1': list(keywords1 - keywords2),
            'unique_in_doc2': list(keywords2 - keywords1),
        }


# Instance globale du service NLP
nlp_service = NLPService()
