import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

/**
 * Validateur pour les codes BIC (Bank Identifier Code)
 */
@ValidatorConstraint({ name: 'isValidBIC', async: false })
export class IsValidBICConstraint implements ValidatorConstraintInterface {
  validate(bic: string) {
    if (!bic) {
      return false;
    }

    // Nettoyer le code (supprimer les espaces)
    bic = bic.replace(/\s+/g, '').toUpperCase();

    // Vérifier le format BIC standard (8 ou 11 caractères)
    // Format: AAAABBCCDDD
    // - AAAA: Code banque (4 lettres)
    // - BB: Code pays (2 lettres)
    // - CC: Code localisation (2 caractères alphanumériques)
    // - DDD: Code branche (3 caractères alphanumériques, optionnel)
    return /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(bic);
  }

  defaultMessage() {
    return 'Le code BIC n\'est pas valide';
  }
}

/**
 * Décorateur pour valider un code BIC
 */
export function IsValidBIC(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidBICConstraint,
    });
  };
}
