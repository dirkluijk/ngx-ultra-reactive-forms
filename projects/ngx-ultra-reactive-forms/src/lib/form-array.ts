import {
  AbstractControl,
  AsyncValidatorFn,
  FormArray as BaseFormArray,
  ValidatorFn
} from 'ngx-typesafe-forms';
import { EMPTY, Observable, of, Subscription } from 'rxjs';

import { AbstractControlOptions } from './internals/abstract-control-options';
import { coerceToObservable, coerceToOptions } from './internals/coercion';
import { Connectable } from './internals/connectable-control';

export class FormArray<T> extends BaseFormArray<T> implements Connectable {
  public set value$(value$: Observable<T[]>) {
    this.inputStreams.value$ = value$;
    this.reconnectIfConnected();
  }

  public set disabled$(disabled$: Observable<boolean>) {
    this.inputStreams.disabled$ = disabled$;
    this.reconnectIfConnected();
  }

  private inputStreams = {
    value$: EMPTY as Observable<T[]>,
    disabled$: of(false)
  };

  private subscriptions: Subscription[] = [];
  private connected = false;

  constructor(
    controls: AbstractControl<T>[],
    validatorOrOpts?: ValidatorFn<T[]> | ValidatorFn<T[]>[] | AbstractControlOptions<T[]> | null,
    asyncValidator?: AsyncValidatorFn<T> | AsyncValidatorFn<T>[] | null
  ) {
    super(controls, validatorOrOpts, asyncValidator);

    const options = coerceToOptions(validatorOrOpts);

    if (options && options.disabled$ !== undefined) {
      this.disabled$ = coerceToObservable(options.disabled$);
    }
  }

  public connect(): void {
    this.subscriptions = [
      this.inputStreams.value$.subscribe((value) => this.setValue(value)),
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
