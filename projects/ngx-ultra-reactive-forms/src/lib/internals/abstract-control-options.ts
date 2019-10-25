import { AbstractControlOptions as BaseAbstractControlOptions } from 'ngx-typesafe-forms';
import { Observable } from 'rxjs';

export interface AbstractControlOptions<T> extends BaseAbstractControlOptions<T> {
  disabled$?: boolean | Observable<boolean>;
}
