import { createDirectiveFactory } from '@ngneat/spectator/jest';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject } from 'rxjs';

import { FormControlDirective } from './form-control.directive';
import { FormControl } from './form-control';

describe('FormControl', () => {
  const createDirective = createDirectiveFactory({
    imports: [BrowserAnimationsModule, ReactiveFormsModule],
    directive: FormControlDirective
  });

  it('should respond to a simple value', () => {
    const spectator = createDirective('<input [formControl]="formControl" />', {
      hostProps: {
        formControl: new FormControl('foo')
      }
    });

    expect(spectator.element).toHaveValue('foo');
  });

  it('should respond to a multiple values', () => {
    const behaviorSubject = new BehaviorSubject('foo');
    const spectator = createDirective('<input [formControl]="formControl" />', {
      hostProps: {
        formControl: new FormControl(behaviorSubject.asObservable())
      }
    });

    expect(spectator.element).toHaveValue('foo');

    behaviorSubject.next('bar');
    spectator.detectChanges();

    expect(spectator.element).toHaveValue('bar');
  });

  it('should respond to disabled streams', () => {
    const behaviorSubject = new BehaviorSubject(false);
    const spectator = createDirective('<input [formControl]="formControl" />', {
      hostProps: {
        formControl: new FormControl('', {
          disabled$: behaviorSubject.asObservable()
        })
      }
    });

    expect(spectator.element).not.toBeDisabled();

    behaviorSubject.next(true);
    spectator.detectChanges();

    expect(spectator.element).toBeDisabled();
  });

  it('should reconnect when changing streams', () => {
    const behaviorSubject1 = new BehaviorSubject('foo');
    const behaviorSubject2 = new BehaviorSubject('lorem');

    const spectator = createDirective('<input [formControl]="formControl" />', {
      hostProps: {
        formControl: new FormControl(behaviorSubject1.asObservable())
      }
    });

    expect(spectator.element).toHaveValue('foo');

    spectator.hostComponent.formControl.value$ = behaviorSubject2.asObservable();

    spectator.detectChanges();
    expect(spectator.element).toHaveValue('lorem');

    behaviorSubject1.next('bar');
    spectator.detectChanges();

    expect(spectator.element).not.toHaveValue('bar');
  });

  it('should disconnect when changing controls', () => {
    const behaviorSubject1 = new BehaviorSubject('foo');
    const behaviorSubject2 = new BehaviorSubject('lorem');

    const control1 = new FormControl(behaviorSubject1.asObservable());
    const control2 = new FormControl(behaviorSubject2.asObservable());

    const spectator = createDirective('<input [formControl]="formControl" />', {
      hostProps: {
        formControl: control1
      }
    });

    expect(control1.value).toBe('foo');
    expect(control2.value).toBe(null);

    spectator.hostComponent.formControl = control2;
    spectator.detectChanges();

    behaviorSubject1.next('bar');
    behaviorSubject2.next('ipsum');

    expect(control1.value).toBe('foo');
    expect(control2.value).toBe('ipsum');
  });
});
