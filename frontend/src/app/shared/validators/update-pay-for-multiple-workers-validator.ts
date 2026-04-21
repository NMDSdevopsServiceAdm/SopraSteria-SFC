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

function validatePayValue(payValueControl: AbstractControl) {
  const { payRate } = payValueControl.parent!.value;

  const payRateIsFilled = payRate !== null && payRate !== '';
  const radioButtonSelected = payValueControl.value;

  if (payRateIsFilled && !radioButtonSelected) {
    return { radioButtonNotSelected: true };
  }
  return null;
}

function validatePayRate(payRateControl: AbstractControl) {
  const { payValue, jobId } = payRateControl.parent?.value ?? {};

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
}

export function buildValidatorsForUpdatePayForMultipleWorkers(validationIsActive: Signal<boolean>) {
  const payValueValidator = CustomValidators.withSignalToggle(validatePayValue, validationIsActive);
  const payRateValidator = CustomValidators.withSignalToggle(validatePayRate, validationIsActive);

  return {
    payValueValidator,
    payRateValidator,
  };
}

const hourlyRateInvalidValidator = CustomValidators.alias(
  Validators.compose([Validators.min(HourlyPayRateLimits.min), Validators.max(HourlyPayRateLimits.max)]),
  ErrorTypes.hourlyRateInvalid,
);

const hourlyRateDecimalPlace = CustomValidators.alias(
  Validators.pattern(HOURLY_PAY_PATTERN),
  ErrorTypes.hourlyRateDecimalPlace,
);
const hourlyRateMissingValidator = CustomValidators.alias(Validators.required, ErrorTypes.hourlyRateMissing);

const hourlyRateValidator = Validators.compose([
  hourlyRateInvalidValidator,
  hourlyRateMissingValidator,
  hourlyRateDecimalPlace,
]) as ValidatorFn;

const annualSalaryInvalidValidator = CustomValidators.alias(
  Validators.compose([Validators.min(AnnualSalaryLimits.min), Validators.max(AnnualSalaryLimits.max)]),
  ErrorTypes.annualSalaryInvalid,
);

const annualSalaryInvalidForSeniorManagement = CustomValidators.alias(
  Validators.compose([
    Validators.min(AnnualSalaryLimitsForSeniorManagement.min),
    Validators.max(AnnualSalaryLimitsForSeniorManagement.max),
  ]),
  ErrorTypes.annualSalaryInvalidSeniorManagement,
);

const annualSalaryMissingValidator = CustomValidators.alias(Validators.required, ErrorTypes.annualSalaryMissing);

const annualSalaryDecimalPlaceValidator = CustomValidators.alias(
  Validators.pattern(ANNUAL_SALARY_PATTERN),
  ErrorTypes.annualSalaryDecimalPlace,
);

const annualSalaryValidator = Validators.compose([
  annualSalaryInvalidValidator,
  annualSalaryMissingValidator,
  annualSalaryDecimalPlaceValidator,
]) as ValidatorFn;

const annualSalaryValidatorForSeniorManagement = Validators.compose([
  annualSalaryInvalidForSeniorManagement,
  annualSalaryMissingValidator,
  annualSalaryDecimalPlaceValidator,
]) as ValidatorFn;
