/* eslint-disable @typescript-eslint/unbound-method */
import {
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import type { EditorComponent } from '../../hugerte-angular-component/src/main/ts/public_api';

@Component({
  selector: 'form-with-on-push',
  templateUrl: './form-with-on-push.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class FormWithOnPushComponent {
  public readonly initialValue = '';
  public readonly init: EditorComponent['init'] = {
    plugins: [ 'help' ],
  };
  public readonly form = new FormGroup({
    rte: new FormControl('', {
      validators: Validators.compose([
        Validators.required,
        Validators.minLength(10)
      ]),
    }),
    regular: new FormControl(''),
  });
}
