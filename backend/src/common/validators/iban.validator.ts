import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/**
 * Validateur pour les numéros IBAN
 */
@ValidatorConstraint({ name: 'isValidIBAN', async: false })
export class IsValidIBANConstraint implements ValidatorConstraintInterface {
  validate(iban: string, args: ValidationArguments) {
    if (!iban) {
      return false;
    }

    // Supprimer les espaces et mettre en majuscules
    iban = iban.replace(/\s+/g, '').toUpperCase();

    // Vérifier le format de base
    if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/.test(iban)) {
      return false;
    }

    // Déplacer les 4 premiers caractères à la fin
    const rearranged = iban.substring(4) + iban.substring(0, 4);

    // Remplacer les lettres par des chiffres (A=10, B=11, ..., Z=35)
    const numeric = rearranged.split('').map(char => {
      const code = char.charCodeAt(0);
      return code >= 65 && code <= 90 ? code - 55 : char;
    }).join('');

    // Calculer le modulo 97
    let remainder = 0;
    for (let i = 0; i < numeric.length; i += 9) {
      const chunk = remainder + numeric.substring(i, i + 9);
      remainder = parseInt(chunk, 10) % 97;
    }

    return remainder === 1;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Le numéro IBAN n\'est pas valide';
  }
}

/**
 * Décorateur pour valider un IBAN
 */
export function IsValidIBAN(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidIBANConstraint,
    });
  };
}
