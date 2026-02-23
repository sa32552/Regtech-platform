import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

/**
 * Validateur pour les numéros de passeport
 */
@ValidatorConstraint({ name: 'isValidPassport', async: false })
export class IsValidPassportConstraint implements ValidatorConstraintInterface {
  validate(passportNumber: string) {
    if (!passportNumber) {
      return false;
    }

    // Nettoyer le numéro (supprimer les espaces)
    passportNumber = passportNumber.replace(/\s+/g, '').toUpperCase();

    // Vérifier le format de base (2 lettres suivies de 6 à 9 chiffres)
    return /^[A-Z]{2}\d{6,9}$/.test(passportNumber);
  }

  defaultMessage() {
    return 'Le numéro de passeport n\'est pas valide';
  }
}

/**
 * Décorateur pour valider un numéro de passeport
 */
export function IsValidPassport(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidPassportConstraint,
    });
  };
}
