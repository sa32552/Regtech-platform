import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/**
 * Validateur pour les scores de risque
 */
@ValidatorConstraint({ name: 'isValidRiskScore', async: false })
export class IsValidRiskScoreConstraint implements ValidatorConstraintInterface {
  validate(score: number, args: ValidationArguments) {
    if (score === null || score === undefined) {
      return false;
    }

    // Le score doit être entre 0 et 100
    return typeof score === 'number' && score >= 0 && score <= 100;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Le score de risque doit être entre 0 et 100';
  }
}

/**
 * Décorateur pour valider un score de risque
 */
export function IsValidRiskScore(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidRiskScoreConstraint,
    });
  };
}
