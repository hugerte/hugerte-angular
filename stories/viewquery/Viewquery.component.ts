import { Component, ViewChild } from '@angular/core';
import { EditorComponent } from '../../hugerte-angular-component/src/main/ts/editor/editor.component';

@Component({
  selector: 'view-query',
  templateUrl: './Viewquery.component.html',
  standalone: false
})
export class ViewQueryComponent {
  @ViewChild(EditorComponent, { static: true }) public editorComponent!: EditorComponent;

  public undo() {
    this.editorComponent.editor?.undoManager.undo();
  }

  public redo() {
    this.editorComponent.editor?.undoManager.redo();
  }
}
