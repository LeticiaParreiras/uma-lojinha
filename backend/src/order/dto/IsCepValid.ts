import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'isCepValid', async: false })
export class IsCepValidConstraint implements ValidatorConstraintInterface {
  validate(cep: string, args: ValidationArguments) {
    if (!cep) return false;

    // Apenas 8 números, sem hífen
    const cepRegex = /^\d{8}$/;
    return cepRegex.test(cep);
  }

  defaultMessage(args: ValidationArguments) {
    return 'O campo CEP ($value) é inválido. Informe apenas 8 números (ex: 12345678).';
  }
}
