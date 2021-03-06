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

interface SetValueOptions {
  onlySelf?: boolean;
  emitEvent?: boolean;
  emitModelToViewChange?: boolean;
  emitViewToModelChange?: boolean;
}

export class FormControl<T> extends BaseFormControl<T> implements Connectable {
  private readonly inputStreams = {
    value$: EMPTY as Observable<T | null>,
    valueOptions: undefined as SetValueOptions | undefined,
    disabled$: EMPTY as Observable<boolean>
  };

  private subscriptions: Subscription[] = [];
  private connected = false;

  constructor(
    formValue?: T | Observable<T>,
    validatorOrOpts?: ValidatorFn<T> | ValidatorFn<T>[] | AbstractControlOptions<T> | null,
    asyncValidator?: AsyncValidatorFn<T> | AsyncValidatorFn<T>[] | null,
    setValueOptions?: SetValueOptions
  ) {
    super(undefined, validatorOrOpts, asyncValidator);

    const options = coerceToOptions(validatorOrOpts);

    if (formValue !== undefined) {
      if (isObservable(formValue)) {
        this.setValue$(formValue, setValueOptions);
      } else {
        this.setValue(formValue, { emitEvent: false });
      }
    }

    if (options && options.disabled$ !== undefined) {
      if (isObservable(options.disabled$)) {
        this.setDisabled$(options.disabled$);
      } else if (options.disabled$) {
        this.disable({ emitEvent: false });
      }
    }
  }

  public setValue$(value$: Observable<T | null>, options?: SetValueOptions): void {
    this.inputStreams.value$ = value$;
    this.inputStreams.valueOptions = options;
    this.reconnectIfConnected();
  }

  public setDisabled$(disabled$: Observable<boolean>): void {
    this.inputStreams.disabled$ = disabled$;
    this.reconnectIfConnected();
  }

  public connect(): void {
    this.connected = true;

    this.subscriptions = [
      this.inputStreams.value$.subscribe((value) => {
        if (value !== null) {
          this.setValue(value, this.inputStreams.valueOptions);
        } else {
          this.reset(undefined, this.inputStreams.valueOptions);
        }
      }),
      this.inputStreams.disabled$.subscribe((disabled) => this.setDisabled(disabled))
    ];
  }

  public disconnect(): void {
    this.connected = false;

    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  public registerOnChange(fn: (_: T) => void): void {
    setTimeout(() => this.throwWarningIfNotConnected());

    super.registerOnChange(fn);
  }

  private reconnectIfConnected(): void {
    if (!this.connected) {
      return;
    }

    this.disconnect();
    this.connect();
  }

  private throwWarningIfNotConnected(): void {
    if (!this.connected && isDevMode()) {
      // tslint:disable-next-line:no-console
      console.warn(
        'It looks like you are using a FormControl from ngx-ultra-reactive-forms without importing its ReactiveFormsModule. ' +
        'Please import it to make use of its reactive FormControl directive.'
      );
    }
  }
}
