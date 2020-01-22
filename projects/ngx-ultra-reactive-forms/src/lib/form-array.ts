import {
  AbstractControl,
  AsyncValidatorFn,
  FormArray as BaseFormArray,
  ValidatorFn
} from 'ngx-typesafe-forms';
import { EMPTY, isObservable, Observable, Subscription } from 'rxjs';

import { AbstractControlOptions } from './internals/abstract-control-options';
import { coerceToOptions } from './internals/coercion';
import { Connectable } from './internals/connectable-control';

interface SetValueOptions {
  onlySelf?: boolean;
  emitEvent?: boolean;
}

export class FormArray<T> extends BaseFormArray<T> implements Connectable {
  private readonly inputStreams = {
    value$: EMPTY as Observable<T[]>,
    valueOptions: undefined as SetValueOptions | undefined,
    disabled$: EMPTY as Observable<boolean>
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
      if (isObservable(options.disabled$)) {
        this.setDisabled$(options.disabled$);
      } else if (options.disabled$) {
        this.disable({ emitEvent: false });
      }
    }
  }

  public setValue$(value$: Observable<T[]>, options?: SetValueOptions): void {
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
      this.inputStreams.value$.subscribe((value: null | T[]) => {
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

  private reconnectIfConnected(): void {
    if (!this.connected) {
      return;
    }

    this.disconnect();
    this.connect();
  }
}
