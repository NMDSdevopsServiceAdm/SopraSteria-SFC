import { Signal } from '@angular/core';
import { AbstractControl, ValidatorFn, Validators } from '@angular/forms';
import {
  ANNUAL_SALARY_PATTERN,
  AnnualSalaryLimits,
  AnnualSalaryLimitsForSeniorManagement,
  HOURLY_PAY_PATTERN,
  HourlyPayRateLimits,
  SeniorManagementJobId,
} from '@core/constants/constants';

import { CustomValidators } from './custom-form-validators';

export enum UpdatePayForMultipleWorkerErrorTypes {
  radioButtonNotSelected = 'radioButtonNotSelected',
  hourlyRateInvalid = 'hourlyRateInvalid',
  annualSalaryInvalid = 'annualSalaryInvalid',
  annualSalaryInvalidSeniorManagement = 'annualSalaryInvalidSeniorManagement',
  hourlyRateMissing = 'hourlyRateMissing',
  annualSalaryMissing = 'annualSalaryMissing',
  hourlyRateDecimalPlace = 'hourlyRateDecimalPlace',
  annualSalaryDecimalPlace = 'annualSalaryDecimalPlace',
}
const ErrorTypes = UpdatePayForMultipleWorkerErrorTypes;

export const UpdatePayForMultipleWorkerErrorMessages: Record<UpdatePayForMultipleWorkerErrorTypes, string> = {
  [ErrorTypes.radioButtonNotSelected]: 'Select hourly or salary for the amount entered',
  [ErrorTypes.hourlyRateInvalid]: `Hourly pay rate must be between ${HourlyPayRateLimits.asString.min} and ${HourlyPayRateLimits.asString.max}`,
  [ErrorTypes.annualSalaryInvalid]: `Salary must be between ${AnnualSalaryLimits.asString.min} and ${AnnualSalaryLimits.asString.max}`,
  [ErrorTypes.annualSalaryInvalidSeniorManagement]: `Salary must be between ${AnnualSalaryLimitsForSeniorManagement.asString.min} and ${AnnualSalaryLimitsForSeniorManagement.asString.max}`,
  [ErrorTypes.hourlyRateMissing]: 'Enter the hourly pay rate or select a different option',
  [ErrorTypes.annualSalaryMissing]: 'Enter the salary or select a different option',
  [ErrorTypes.hourlyRateDecimalPlace]: 'You can only have 1 or 2 digits for pence after the decimal point',
  [ErrorTypes.annualSalaryDecimalPlace]: 'Salary must not include pence',
};

const { alias, buildCompositeValidator } = CustomValidators;

export function buildValidatorsForUpdatePayForMultipleWorkers(validationIsActive: Signal<boolean>) {
  const payValueValidator = buildValidatorForPayValue(validationIsActive);
  const payRateValidator = buildValidatorForPayRate(validationIsActive);

  return { payValueValidator, payRateValidator };
}

function buildValidatorForPayValue(validationIsActive: Signal<boolean>) {
  const payValueValidator: ValidatorFn = (payValueControl: AbstractControl) => {
    if (!validationIsActive()) {
      return payValueControl.errors;
    }

    const { payRate } = payValueControl.parent!.value;
    const payRateIsFilled = payRate !== null && payRate !== '';
    const radioButtonSelected = payValueControl.value;

    if (payRateIsFilled && !radioButtonSelected) {
      return { radioButtonNotSelected: true };
    }
    return null;
  };

  return payValueValidator;
}

function buildValidatorForPayRate(validationIsActive: Signal<boolean>) {
  const hourlyRateInvalidValidator = buildCompositeValidator(
    [Validators.min(HourlyPayRateLimits.min), Validators.max(HourlyPayRateLimits.max)],
    ErrorTypes.hourlyRateInvalid,
  );
  const hourlyRateDecimalPlace = alias(Validators.pattern(HOURLY_PAY_PATTERN), ErrorTypes.hourlyRateDecimalPlace);
  const hourlyRateMissingValidator = alias(Validators.required, ErrorTypes.hourlyRateMissing);

  const hourlyRateValidator = buildCompositeValidator([
    hourlyRateInvalidValidator,
    hourlyRateMissingValidator,
    hourlyRateDecimalPlace,
  ]);

  const annualSalaryInvalidValidator = buildCompositeValidator(
    [Validators.min(AnnualSalaryLimits.min), Validators.max(AnnualSalaryLimits.max)],
    ErrorTypes.annualSalaryInvalid,
  );

  const annualSalaryInvalidForSeniorManagement = buildCompositeValidator(
    [
      Validators.min(AnnualSalaryLimitsForSeniorManagement.min),
      Validators.max(AnnualSalaryLimitsForSeniorManagement.max),
    ],
    ErrorTypes.annualSalaryInvalidSeniorManagement,
  );
  const annualSalaryMissingValidator = alias(Validators.required, ErrorTypes.annualSalaryMissing);
  const annualSalaryDecimalPlaceValidator = alias(
    Validators.pattern(ANNUAL_SALARY_PATTERN),
    ErrorTypes.annualSalaryDecimalPlace,
  );
  const annualSalaryValidator = buildCompositeValidator([
    annualSalaryInvalidValidator,
    annualSalaryMissingValidator,
    annualSalaryDecimalPlaceValidator,
  ]);

  const annualSalaryValidatorForSeniorManagement = buildCompositeValidator([
    annualSalaryInvalidForSeniorManagement,
    annualSalaryMissingValidator,
    annualSalaryDecimalPlaceValidator,
  ]);

  const payRateValidator: ValidatorFn = (payRateControl: AbstractControl) => {
    if (!validationIsActive()) {
      return payRateControl.errors;
    }

    const { payValue, jobId } = payRateControl.parent!.value;

    switch (payValue) {
      case 'Hourly': {
        return hourlyRateValidator(payRateControl);
      }
      case 'Annually': {
        const validatorToUse =
          jobId === SeniorManagementJobId ? annualSalaryValidatorForSeniorManagement : annualSalaryValidator;
        return validatorToUse(payRateControl);
      }
    }
    return null;
  };
  return payRateValidator;
}
