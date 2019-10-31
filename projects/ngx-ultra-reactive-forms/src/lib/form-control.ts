import {
  AsyncValidatorFn,
  FormControl as BaseFormControl,
  ValidatorFn
} from 'ngx-typesafe-forms';
import { EMPTY, isObservable, Observable, Subscription } from 'rxjs';
import { isDevMode } from '@angular/core';

import { AbstractControlOptions } from './internals/abstract-control-options';
import { coerceToOptions } from './internals/coercion';
import { Connectable } from './internals/connectable-control';

export class FormControl<T> extends BaseFormControl<T> implements Connectable {
  private readonly inputStreams = {
    value$: EMPTY as Observable<T | null>,
    disabled$: EMPTY as Observable<boolean>
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
      if (isObservable(formValue)) {
        this.setValue$(formValue);
      } else {
        this.setValue(formValue, { emitEvent: false });
      }
    }

    if (options && options.disabled$ !== undefined) {
      if (isObservable(options.disabled$)) {
        this.setDisabled$(options.disabled$);
      } else if (!options.disabled$) {
        this.disable({ emitEvent: false });
      }
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

  public registerOnChange(fn: (_: T) => void): void {
    if (!this.connected && isDevMode()) {
      // tslint:disable-next-line:no-console
      console.warn(
        'It looks like you are using a FormControl from ngx-ultra-reactive-forms without importing its ReactiveFormsModule. ' +
        'Please import it to make use of its reactive FormControl directive.'
      );
    }

    super.registerOnChange(fn);
  }

  private reconnectIfConnected(): void {
    if (!this.connected) {
      return;
    }

    this.disconnect();
    this.connect();
  }
}
