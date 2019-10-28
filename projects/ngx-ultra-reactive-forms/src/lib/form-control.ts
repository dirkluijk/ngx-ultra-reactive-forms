import {
  AsyncValidatorFn,
  FormControl as BaseFormControl,
  ValidatorFn
} from 'ngx-typesafe-forms';
import { EMPTY, isObservable, Observable, of, Subscription } from 'rxjs';

import { AbstractControlOptions } from './internals/abstract-control-options';
import { coerceToObservable, coerceToOptions } from './internals/coercion';
import { Connectable } from './internals/connectable-control';

export class FormControl<T> extends BaseFormControl<T> implements Connectable {
  private readonly inputStreams = {
    value$: EMPTY as Observable<T | null>,
    disabled$: of(false)
  };

  private subscriptions: Subscription[] = [];
  private connected = false;

  constructor(
    formValue?: T | Observable<T>,
    validatorOrOpts?: ValidatorFn<T> | ValidatorFn<T>[] | AbstractControlOptions<T> | null,
    asyncValidator?: AsyncValidatorFn<T> | AsyncValidatorFn<T>[] | null
  ) {
    super(undefined, validatorOrOpts, asyncValidator);

    const options = coerceToOptions(validatorOrOpts);

    if (formValue !== undefined) {
      if (!isObservable(formValue)) {
        this.setValue(formValue);
      }

      this.setValue$(coerceToObservable(formValue));
    }

    if (options && options.disabled$ !== undefined) {
      this.setDisabled$(coerceToObservable(options.disabled$));
    }
  }

  public setValue$(value$: Observable<T | null>): void {
    this.inputStreams.value$ = value$;
    this.reconnectIfConnected();
  }

  public setDisabled$(disabled$: Observable<boolean>): void {
    this.inputStreams.disabled$ = disabled$;
    this.reconnectIfConnected();
  }

  public connect(): void {
    this.subscriptions = [
      this.inputStreams.value$.subscribe((value) => value !== null ? this.setValue(value) : this.reset()),
      this.inputStreams.disabled$.subscribe((disabled) => this.setDisabled(disabled))
    ];

    this.connected = true;
  }

  public disconnect(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  private reconnectIfConnected(): void {
    if (!this.connected) {
      return;
    }

    this.disconnect();
    this.connect();
  }
}
