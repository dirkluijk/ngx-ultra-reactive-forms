import { isObservable, Observable, of } from 'rxjs';
import { ValidatorFn } from '@angular/forms';

import { AbstractControlOptions } from './abstract-control-options';

function isOptionsObj<T>(
  validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions<T> | null
): validatorOrOpts is AbstractControlOptions<T> {
  return validatorOrOpts !== null && !Array.isArray(validatorOrOpts) && typeof validatorOrOpts === 'object';
}

export function coerceToOptions<T>(
  validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions<T> | null): AbstractControlOptions<T> | null {
  return isOptionsObj(validatorOrOpts) ? validatorOrOpts : null;
}

export function coerceToObservable<T>(value: T | Observable<T>): Observable<T> {
  return isObservable(value) ? value : of(value);
}
