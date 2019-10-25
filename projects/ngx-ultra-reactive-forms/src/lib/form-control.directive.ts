import { Directive, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';

import { isConnectable } from './internals/connectable-control';

// tslint:disable-next-line:directive-selector
@Directive({ selector: '[formControl]' })
export class FormControlDirective implements OnChanges, OnDestroy {
  @Input('formControl') public control!: FormControl;

  public ngOnChanges(changes: SimpleChanges): void {
    const previousControl = changes.control.previousValue;
    const currentControl = changes.control.currentValue;

    if (currentControl !== previousControl) {
      if (isConnectable(previousControl) && currentControl !== previousControl) {
        previousControl.disconnect();
      }

      if (isConnectable(currentControl) && currentControl !== previousControl) {
        currentControl.connect();
      }
    }
  }

  public ngOnDestroy(): void {
    if (isConnectable(this.control)) {
      this.control.disconnect();
    }
  }
}
