import {
  AbstractControl,
  AsyncValidatorFn,
  FormGroup as BaseFormGroup,
  ValidatorFn
} from 'ngx-typesafe-forms';
import { EMPTY, Observable, of, Subscription } from 'rxjs';

import { Connectable } from './internals/connectable-control';
import { AbstractControlOptions } from './internals/abstract-control-options';
import { coerceToObservable, coerceToOptions } from './internals/coercion';

export class FormGroup<T> extends BaseFormGroup<T> implements Connectable {
  private inputStreams = {
    value$: EMPTY as Observable<T | null>,
    disabled$: of(false)
  };

  private subscriptions: Subscription[] = [];
  private connected = false;

  constructor(
    controls: { [K in keyof T]: AbstractControl<T[K]> },
    validatorOrOpts?: ValidatorFn<T> | ValidatorFn<T>[] | AbstractControlOptions<T> | null,
    asyncValidator?: AsyncValidatorFn<T> | AsyncValidatorFn<T>[] | null
  ) {
    super(controls, validatorOrOpts, asyncValidator);

    const options = coerceToOptions(validatorOrOpts);

    if (options && options.disabled$ !== undefined) {
      this.setDisabled$(coerceToObservable(options.disabled$));
    }
  }

  public setValue$(value$: Observable<T>): void {
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
