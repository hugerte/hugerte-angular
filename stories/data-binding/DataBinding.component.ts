/* eslint-disable no-console */
import { Component } from '@angular/core';
import { modelEvents, sampleContent } from '../Settings';

@Component({
  selector: 'binding',
  templateUrl: './DataBinding.component.html'
})
export class BindingComponent {
  public isEditingContent = true;
  public content = sampleContent;
  public modelEvents = modelEvents;

  public editContent() {
    this.isEditingContent = !this.isEditingContent;
  }

  public log({ event, editor }: any) {
    console.log(event);
    console.log(editor.getContent());
  }
}
