import { AbstractControl } from 'ngx-typesafe-forms';

import { FormControl } from '../form-control';
import { FormArray } from '../form-array';
import { FormGroup } from '../form-group';

export function isConnectable<T>(control: AbstractControl<T>): control is AbstractControl<T> & Connectable {
  return control instanceof FormControl || control instanceof FormGroup || control instanceof FormArray;
}

export interface Connectable {
  connect(): void;
  disconnect(): void;
}
