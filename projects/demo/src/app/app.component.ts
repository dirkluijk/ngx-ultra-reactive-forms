import { Component } from '@angular/core';
import { map } from 'rxjs/operators';
import { FormControl } from 'ngx-ultra-reactive-forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'
  ]
})
export class AppComponent {
  public formControl1 = new FormControl('foo');

  public formControl2 = new FormControl(this.formControl1.value$, {
      disabled$: this.formControl1.value$.pipe(map((value) => value.length > 5))
    }
  );
}
