import spacy
from typing import Dict, List, Optional, Tuple
import logging
import re
from datetime import datetime

from config import settings

logger = logging.getLogger(__name__)


class NERService:
    """Service NER pour l'extraction d'entités nommées spécifiques à la conformité"""

    def __init__(self):
        """Initialiser le service NER avec Spacy"""
        try:
            # Charger le modèle Spacy français
            self.nlp = spacy.load(settings.SPACY_MODEL)

            # Définir les patterns personnalisés pour les entités spécifiques à la conformité
            self._setup_custom_patterns()

            logger.info(f"Service NER initialisé avec le modèle {settings.SPACY_MODEL}")
        except Exception as e:
            logger.error(f"Erreur lors de l'initialisation du service NER: {str(e)}")
            raise

    def extract_entities(self, text: str) -> Dict:
        """
        Extraire toutes les entités nommées du texte

        Args:
            text: Texte à analyser

        Returns:
            Dictionnaire contenant les entités extraites par catégorie
        """
        try:
            doc = self.nlp(text)

            entities = {
                'persons': self._extract_persons(doc),
                'organizations': self._extract_organizations(doc),
                'locations': self._extract_locations(doc),
                'dates': self._extract_dates(doc),
                'emails': self._extract_emails(text),
                'phone_numbers': self._extract_phone_numbers(text),
                'iban': self._extract_iban(text),
                'bic': self._extract_bic(text),
                'passport_numbers': self._extract_passport_numbers(text),
                'id_numbers': self._extract_id_numbers(text),
                'addresses': self._extract_addresses(doc),
                'companies': self._extract_companies(doc),
                'legal_entities': self._extract_legal_entities(doc),
            }

            logger.info(f"Extraction d'entités réussie: {sum(len(v) for v in entities.values())} entités trouvées")
            return entities

        except Exception as e:
            logger.error(f"Erreur lors de l'extraction des entités: {str(e)}")
            raise

    def extract_kyc_entities(self, text: str) -> Dict:
        """
        Extraire les entités spécifiques au KYC

        Args:
            text: Texte à analyser

        Returns:
            Dictionnaire contenant les entités KYC extraites
        """
        try:
            doc = self.nlp(text)

            kyc_entities = {
                'full_name': self._extract_full_name(doc),
                'date_of_birth': self._extract_date_of_birth(text),
                'place_of_birth': self._extract_place_of_birth(doc),
                'nationality': self._extract_nationality(doc),
                'address': self._extract_address(doc),
                'phone_number': self._extract_phone_number(text),
                'email': self._extract_email(text),
                'id_number': self._extract_id_number(text),
                'passport_number': self._extract_passport_number(text),
                'profession': self._extract_profession(doc),
                'employer': self._extract_employer(doc),
            }

            logger.info(f"Extraction d'entités KYC réussie")
            return kyc_entities

        except Exception as e:
            logger.error(f"Erreur lors de l'extraction des entités KYC: {str(e)}")
            raise

    def extract_aml_entities(self, text: str) -> Dict:
        """
        Extraire les entités spécifiques à l'AML

        Args:
            text: Texte à analyser

        Returns:
            Dictionnaire contenant les entités AML extraites
        """
        try:
            doc = self.nlp(text)

            aml_entities = {
                'transaction_parties': self._extract_transaction_parties(doc),
                'transaction_amounts': self._extract_transaction_amounts(text),
                'transaction_dates': self._extract_transaction_dates(text),
                'bank_accounts': self._extract_bank_accounts(text),
                'countries': self._extract_countries(doc),
                'currencies': self._extract_currencies(doc),
                'sanctions_entities': self._extract_sanctions_entities(doc),
                'watchlist_entities': self._extract_watchlist_entities(doc),
            }

            logger.info(f"Extraction d'entités AML réussie")
            return aml_entities

        except Exception as e:
            logger.error(f"Erreur lors de l'extraction des entités AML: {str(e)}")
            raise

    def _setup_custom_patterns(self):
        """Configurer les patterns personnalisés pour les entités spécifiques"""
        # Patterns pour les numéros de passeport
        self.passport_pattern = re.compile(r'[A-Z]{2}\d{7}')

        # Pattern pour les IBAN
        self.iban_pattern = re.compile(r'[A-Z]{2}\d{2}[A-Z0-9]{11,30}')

        # Pattern pour les BIC
        self.bic_pattern = re.compile(r'[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?')

        # Pattern pour les emails
        self.email_pattern = re.compile(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}')

        # Pattern pour les numéros de téléphone
        self.phone_pattern = re.compile(r'(?:\+?33|0)[1-9](?:[\s.-]?\d{2}){4}')

        # Pattern pour les montants
        self.amount_pattern = re.compile(r'(\d+[.,]\d{2})\s*(?:EUR|€|\$|USD|GBP|£)')

    def _extract_persons(self, doc) -> List[Dict]:
        """Extraire les personnes"""
        return [
            {
                'text': ent.text,
                'start': ent.start_char,
                'end': ent.end_char,
                'confidence': 1.0,
            }
            for ent in doc.ents
            if ent.label_ == 'PER'
        ]

    def _extract_organizations(self, doc) -> List[Dict]:
        """Extraire les organisations"""
        return [
            {
                'text': ent.text,
                'start': ent.start_char,
                'end': ent.end_char,
                'confidence': 1.0,
            }
            for ent in doc.ents
            if ent.label_ == 'ORG'
        ]

    def _extract_locations(self, doc) -> List[Dict]:
        """Extraire les lieux"""
        return [
            {
                'text': ent.text,
                'start': ent.start_char,
                'end': ent.end_char,
                'confidence': 1.0,
            }
            for ent in doc.ents
            if ent.label_ == 'LOC'
        ]

    def _extract_dates(self, doc) -> List[Dict]:
        """Extraire les dates"""
        return [
            {
                'text': ent.text,
                'start': ent.start_char,
                'end': ent.end_char,
                'normalized': self._normalize_date(ent.text),
                'confidence': 1.0,
            }
            for ent in doc.ents
            if ent.label_ == 'DATE'
        ]

    def _extract_emails(self, text: str) -> List[Dict]:
        """Extraire les emails"""
        matches = self.email_pattern.finditer(text)
        return [
            {
                'text': match.group(),
                'start': match.start(),
                'end': match.end(),
                'confidence': 1.0,
            }
            for match in matches
        ]

    def _extract_phone_numbers(self, text: str) -> List[Dict]:
        """Extraire les numéros de téléphone"""
        matches = self.phone_pattern.finditer(text)
        return [
            {
                'text': match.group(),
                'start': match.start(),
                'end': match.end(),
                'normalized': self._normalize_phone_number(match.group()),
                'confidence': 1.0,
            }
            for match in matches
        ]

    def _extract_iban(self, text: str) -> List[Dict]:
        """Extraire les IBAN"""
        matches = self.iban_pattern.finditer(text)
        return [
            {
                'text': match.group(),
                'start': match.start(),
                'end': match.end(),
                'normalized': self._normalize_iban(match.group()),
                'confidence': 1.0,
            }
            for match in matches
        ]

    def _extract_bic(self, text: str) -> List[Dict]:
        """Extraire les BIC"""
        matches = self.bic_pattern.finditer(text)
        return [
            {
                'text': match.group(),
                'start': match.start(),
                'end': match.end(),
                'confidence': 1.0,
            }
            for match in matches
        ]

    def _extract_passport_numbers(self, text: str) -> List[Dict]:
        """Extraire les numéros de passeport"""
        matches = self.passport_pattern.finditer(text)
        return [
            {
                'text': match.group(),
                'start': match.start(),
                'end': match.end(),
                'confidence': 1.0,
            }
            for match in matches
        ]

    def _extract_id_numbers(self, text: str) -> List[Dict]:
        """Extraire les numéros d'identité"""
        # Pattern pour les numéros de carte d'identité française
        id_pattern = re.compile(r'\d{12}')
        matches = id_pattern.finditer(text)
        return [
            {
                'text': match.group(),
                'start': match.start(),
                'end': match.end(),
                'confidence': 1.0,
            }
            for match in matches
        ]

    def _extract_addresses(self, doc) -> List[Dict]:
        """Extraire les adresses"""
        # Chercher des patterns d'adresse (rue, avenue, etc.)
        address_keywords = {'rue', 'avenue', 'boulevard', 'bd', 'impasse', 'place'}
        addresses = []

        for sent in doc.sents:
            if any(keyword in sent.text.lower() for keyword in address_keywords):
                addresses.append({
                    'text': sent.text.strip(),
                    'start': sent.start_char,
                    'end': sent.end_char,
                    'confidence': 0.8,
                })

        return addresses

    def _extract_companies(self, doc) -> List[Dict]:
        """Extraire les entreprises"""
        # Chercher des patterns d'entreprise (SARL, SA, SAS, etc.)
        company_keywords = {'sarl', 'sa', 'sas', 'eurl', 'sasu', 'scop', 'scs', 'sca'}
        companies = []

        for ent in doc.ents:
            if ent.label_ == 'ORG' and any(keyword in ent.text.lower() for keyword in company_keywords):
                companies.append({
                    'text': ent.text,
                    'start': ent.start_char,
                    'end': ent.end_char,
                    'confidence': 1.0,
                })

        return companies

    def _extract_legal_entities(self, doc) -> List[Dict]:
        """Extraire les entités légales"""
        # Chercher des motifs juridiques (association, fondation, etc.)
        legal_keywords = {'association', 'fondation', 'syndicat', 'coopérative', 'mutuelle'}
        legal_entities = []

        for ent in doc.ents:
            if ent.label_ == 'ORG' and any(keyword in ent.text.lower() for keyword in legal_keywords):
                legal_entities.append({
                    'text': ent.text,
                    'start': ent.start_char,
                    'end': ent.end_char,
                    'confidence': 1.0,
                })

        return legal_entities

    def _extract_full_name(self, doc) -> Optional[Dict]:
        """Extraire le nom complet"""
        # Chercher le premier PER (personne) comme nom complet
        for ent in doc.ents:
            if ent.label_ == 'PER':
                return {
                    'text': ent.text,
                    'start': ent.start_char,
                    'end': ent.end_char,
                    'confidence': 1.0,
                }
        return None

    def _extract_date_of_birth(self, text: str) -> Optional[Dict]:
        """Extraire la date de naissance"""
        # Chercher des patterns de date de naissance
        dob_patterns = [
            r'(?:né|née|né le|née le)\s*(\d{1,2}[/-]\d{1,2}[/-]\d{4})',
            r'(?:né|née|née le|né le)\s*(\d{1,2}\s*(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s*\d{4})',
        ]

        for pattern in dob_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return {
                    'text': match.group(),
                    'start': match.start(),
                    'end': match.end(),
                    'normalized': self._normalize_date(match.group(1)),
                    'confidence': 0.9,
                }

        return None

    def _extract_place_of_birth(self, doc) -> Optional[Dict]:
        """Extraire le lieu de naissance"""
        # Chercher des patterns de lieu de naissance
        for sent in doc.sents:
            if 'né' in sent.text.lower() or 'née' in sent.text.lower():
                for ent in sent.ents:
                    if ent.label_ == 'LOC' or ent.label_ == 'GPE':
                        return {
                            'text': ent.text,
                            'start': ent.start_char,
                            'end': ent.end_char,
                            'confidence': 0.9,
                        }
        return None

    def _extract_nationality(self, doc) -> Optional[Dict]:
        """Extraire la nationalité"""
        # Chercher des patterns de nationalité
        for ent in doc.ents:
            if ent.label_ == 'NORP':
                return {
                    'text': ent.text,
                    'start': ent.start_char,
                    'end': ent.end_char,
                    'confidence': 1.0,
                }
        return None

    def _extract_address(self, doc) -> Optional[Dict]:
        """Extraire l'adresse"""
        # Chercher des patterns d'adresse
        for sent in doc.sents:
            if any(keyword in sent.text.lower() for keyword in ['rue', 'avenue', 'boulevard', 'bd']):
                return {
                    'text': sent.text.strip(),
                    'start': sent.start_char,
                    'end': sent.end_char,
                    'confidence': 0.8,
                }
        return None

    def _extract_phone_number(self, text: str) -> Optional[Dict]:
        """Extraire le numéro de téléphone"""
        match = self.phone_pattern.search(text)
        if match:
            return {
                'text': match.group(),
                'start': match.start(),
                'end': match.end(),
                'normalized': self._normalize_phone_number(match.group()),
                'confidence': 1.0,
            }
        return None

    def _extract_email(self, text: str) -> Optional[Dict]:
        """Extraire l'email"""
        match = self.email_pattern.search(text)
        if match:
            return {
                'text': match.group(),
                'start': match.start(),
                'end': match.end(),
                'confidence': 1.0,
            }
        return None

    def _extract_id_number(self, text: str) -> Optional[Dict]:
        """Extraire le numéro d'identité"""
        id_pattern = re.compile(r'\d{12}')
        match = id_pattern.search(text)
        if match:
            return {
                'text': match.group(),
                'start': match.start(),
                'end': match.end(),
                'confidence': 1.0,
            }
        return None

    def _extract_passport_number(self, text: str) -> Optional[Dict]:
        """Extraire le numéro de passeport"""
        match = self.passport_pattern.search(text)
        if match:
            return {
                'text': match.group(),
                'start': match.start(),
                'end': match.end(),
                'confidence': 1.0,
            }
        return None

    def _extract_profession(self, doc) -> Optional[Dict]:
        """Extraire la profession"""
        # Chercher des patterns de profession
        profession_keywords = {'profession', 'métier', 'travail', 'emploi', 'activité professionnelle'}
        for sent in doc.sents:
            if any(keyword in sent.text.lower() for keyword in profession_keywords):
                # Extraire le mot après le mot-clé
                for token in sent:
                    if token.text.lower() in profession_keywords:
                        # Chercher le nom suivant
                        for next_token in token.nbor(1).nbor(2).nbor(3).nbor(4):
                            if next_token.pos_ == 'NOUN':
                                return {
                                    'text': next_token.text,
                                    'start': next_token.idx,
                                    'end': next_token.idx + len(next_token.text),
                                    'confidence': 0.7,
                                }
        return None

    def _extract_employer(self, doc) -> Optional[Dict]:
        """Extraire l'employeur"""
        # Chercher des patterns d'employeur
        employer_keywords = {'employeur', 'employé chez', 'travaille chez', 'société', 'entreprise'}
        for sent in doc.sents:
            if any(keyword in sent.text.lower() for keyword in employer_keywords):
                for ent in sent.ents:
                    if ent.label_ == 'ORG':
                        return {
                            'text': ent.text,
                            'start': ent.start_char,
                            'end': ent.end_char,
                            'confidence': 0.8,
                        }
        return None

    def _extract_transaction_parties(self, doc) -> List[Dict]:
        """Extraire les parties à une transaction"""
        parties = []
        for ent in doc.ents:
            if ent.label_ in ['PER', 'ORG']:
                parties.append({
                    'text': ent.text,
                    'type': ent.label_,
                    'start': ent.start_char,
                    'end': ent.end_char,
                    'confidence': 1.0,
                })
        return parties

    def _extract_transaction_amounts(self, text: str) -> List[Dict]:
        """Extraire les montants de transaction"""
        matches = self.amount_pattern.finditer(text)
        return [
            {
                'text': match.group(),
                'start': match.start(),
                'end': match.end(),
                'normalized': self._normalize_amount(match.group()),
                'confidence': 1.0,
            }
            for match in matches
        ]

    def _extract_transaction_dates(self, text: str) -> List[Dict]:
        """Extraire les dates de transaction"""
        # Pattern pour les dates de transaction
        date_patterns = [
            r'(\d{1,2}[/-]\d{1,2}[/-]\d{4})',
            r'(\d{1,2}\s*(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s*\d{4})',
        ]

        dates = []
        for pattern in date_patterns:
            matches = re.finditer(pattern, text)
            for match in matches:
                dates.append({
                    'text': match.group(),
                    'start': match.start(),
                    'end': match.end(),
                    'normalized': self._normalize_date(match.group()),
                    'confidence': 1.0,
                })

        return dates

    def _extract_bank_accounts(self, text: str) -> List[Dict]:
        """Extraire les comptes bancaires"""
        accounts = []

        # Extraire les IBAN
        iban_matches = self.iban_pattern.finditer(text)
        for match in iban_matches:
            accounts.append({
                'type': 'IBAN',
                'text': match.group(),
                'start': match.start(),
                'end': match.end(),
                'normalized': self._normalize_iban(match.group()),
                'confidence': 1.0,
            })

        # Extraire les BIC
        bic_matches = self.bic_pattern.finditer(text)
        for match in bic_matches:
            accounts.append({
                'type': 'BIC',
                'text': match.group(),
                'start': match.start(),
                'end': match.end(),
                'confidence': 1.0,
            })

        return accounts

    def _extract_countries(self, doc) -> List[Dict]:
        """Extraire les pays"""
        return [
            {
                'text': ent.text,
                'start': ent.start_char,
                'end': ent.end_char,
                'confidence': 1.0,
            }
            for ent in doc.ents
            if ent.label_ == 'GPE' or ent.label_ == 'LOC'
        ]

    def _extract_currencies(self, doc) -> List[Dict]:
        """Extraire les devises"""
        # Chercher des symboles de devise
        currency_symbols = {'€', '$', '£', '¥', '₹'}
        currencies = []

        for token in doc:
            if token.text in currency_symbols:
                currencies.append({
                    'text': token.text,
                    'start': token.idx,
                    'end': token.idx + len(token.text),
                    'confidence': 1.0,
                })

        return currencies

    def _extract_sanctions_entities(self, doc) -> List[Dict]:
        """Extraire les entités sous sanctions"""
        # Dans une implémentation complète, cela interrogerait une base de données de sanctions
        # Pour l'instant, on retourne une liste vide
        return []

    def _extract_watchlist_entities(self, doc) -> List[Dict]:
        """Extraire les entités sur les listes de surveillance"""
        # Dans une implémentation complète, cela interrogerait des watchlists
        # Pour l'instant, on retourne une liste vide
        return []

    def _normalize_date(self, date_str: str) -> Optional[str]:
        """Normaliser une date"""
        # Tenter de parser et reformater la date
        date_formats = [
            '%d/%m/%Y',
            '%d-%m-%Y',
            '%d/%m/%y',
            '%d-%m-%y',
        ]

        for fmt in date_formats:
            try:
                date = datetime.strptime(date_str, fmt)
                return date.strftime('%Y-%m-%d')
            except ValueError:
                continue

        return None

    def _normalize_phone_number(self, phone_str: str) -> str:
        """Normaliser un numéro de téléphone"""
        # Supprimer tous les caractères non numériques sauf le +
        normalized = re.sub(r'[^\d+]', '', phone_str)
        return normalized

    def _normalize_iban(self, iban_str: str) -> str:
        """Normaliser un IBAN"""
        # Supprimer les espaces et mettre en majuscules
        normalized = re.sub(r'\s', '', iban_str).upper()
        return normalized

    def _normalize_amount(self, amount_str: str) -> str:
        """Normaliser un montant"""
        # Remplacer la virgule par un point et supprimer les espaces
        normalized = re.sub(r'[,\s]', '', amount_str)
        return normalized


# Instance globale du service NER
ner_service = NERService()
