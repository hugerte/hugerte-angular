/* eslint-disable no-console */
import { Component } from '@angular/core';

@Component({
  selector: 'event-binding',
  templateUrl: './EventBinding.component.html',
  standalone: false
})
export class EventBindingComponent {
  public fieldValue = 'some value';
  public initObject = {
    height: 500,
    setup: (editor: any) => {
      editor.on('SetContent', (_e: any) => this.hugeRTESetContent());
      editor.on('Init', () => this.hugeRTEInit());
    }
  };

  public hugeRTESetContent() {
    console.log('set by HugeRTE');
  }

  public angularSetContent() {
    console.log('set by angular');
  }

  public hugeRTEInit() {
    console.log('init by HugeRTE');
  }

  public angularInit() {
    console.log('init by angular');
  }

  public realAngularInit(e1: any) {
    console.log('Ready NgModel', e1);
  }
}
