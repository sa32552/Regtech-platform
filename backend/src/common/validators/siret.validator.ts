import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

/**
 * Validateur pour les numéros SIRET
 */
@ValidatorConstraint({ name: 'isValidSIRET', async: false })
export class IsValidSIRETConstraint implements ValidatorConstraintInterface {
  validate(siret: string) {
    if (!siret) {
      return false;
    }

    // Nettoyer le numéro (supprimer les espaces et les points)
    siret = siret.replace(/[\s.]/g, '');

    // Vérifier le format (14 chiffres)
    if (!/^\d{14}$/.test(siret)) {
      return false;
    }

    // Algorithme de Luhn pour valider le SIRET
    let sum = 0;
    let alternate = false;

    for (let i = siret.length - 1; i >= 0; i--) {
      let digit = parseInt(siret.charAt(i), 10);

      if (alternate) {
        digit *= 2;
        if (digit > 9) {
          digit = Math.floor(digit / 10) + (digit % 10);
        }
      }

      sum += digit;
      alternate = !alternate;
    }

    return sum % 10 === 0;
  }

  defaultMessage() {
    return 'Le numéro SIRET n\'est pas valide';
  }
}

/**
 * Décorateur pour valider un numéro SIRET
 */
export function IsValidSIRET(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidSIRETConstraint,
    });
  };
}
