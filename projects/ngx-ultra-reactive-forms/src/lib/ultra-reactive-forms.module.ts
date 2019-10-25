import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { FormControlDirective } from './form-control.directive';

@NgModule({
  imports: [ReactiveFormsModule],
  declarations: [FormControlDirective],
  exports: [ReactiveFormsModule, FormControlDirective]
})
export class UltraReactiveFormsModule {}
