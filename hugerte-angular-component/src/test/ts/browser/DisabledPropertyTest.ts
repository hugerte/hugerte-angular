import '../alien/InitTestEnvironment';

import { Component, ViewChild } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { Assertions, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';

import { EditorComponent } from '../../../main/ts/editor/editor.component';
import { eachVersionContext, editorHook } from '../alien/TestHooks';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('DisabledPropertyTest', () => {
  const getMode = (editor: any) => {
    return editor.mode?.get ? editor.mode.get() : 'design';
  };

  const assertDisabled = (editor: any, disabled: boolean) => {
    const mode = getMode(editor);
    const isDisabled = mode === 'readonly';
    Assertions.assertEq('Editor should be disabled', disabled, isDisabled);
  };

  const assertDesignMode = (editor: any) => {
    Assertions.assertEq('Editor should be in design mode', 'design', getMode(editor));
  };

  eachVersionContext([ '1' ], () => {
    @Component({
      standalone: true,
      imports: [ EditorComponent ],
      template: `<editor [disabled]="disabled" />`,
    })
    class EditorWithDisabledInput {
      public disabled = true;
    }
    const createFixture = editorHook(EditorWithDisabledInput);

    it('should initialize in disabled state', async () => {
      const fixture = await createFixture();
      assertDisabled(fixture.editor, true);
    });

    it('should toggle disabled state', async () => {
      const fixture = await createFixture();
      assertDisabled(fixture.editor, true);

      fixture.componentInstance.disabled = false;
      fixture.detectChanges();
      await Waiter.pTryUntil('Waited too long for mode change', () => {
        assertDesignMode(fixture.editor);
      });

      fixture.componentInstance.disabled = true;
      fixture.detectChanges();
      await Waiter.pTryUntil('Waited too long for mode change', () => {
        assertDisabled(fixture.editor, true);
      });
    });

    @Component({
      standalone: true,
      imports: [ EditorComponent, FormsModule ],
      template: `<editor [(ngModel)]="content" [disabled]="true" />`,
    })
    class EditorWithNgModelDisabled {
      public content = '<h1>Hello World</h1>';
      @ViewChild(EditorComponent) public editorRef!: EditorComponent;
    }

    it('disabled property should work with [ngModel] when HugeRTE has been loaded before editor component has been created', async () => {
      await TestBed.configureTestingModule({
        imports: [ EditorWithNgModelDisabled ]
      }).compileComponents();

      const fixture = TestBed.createComponent(EditorWithNgModelDisabled);
      fixture.detectChanges();

      const tinyEditor = fixture.componentInstance.editorRef.editor;
      await Waiter.pTryUntil('Waited too long for editor to initialize', () => {
        Assertions.assertEq('Editor should exist', true, tinyEditor !== undefined);
        if (tinyEditor) {
          assertDisabled(tinyEditor, true);
        }
      });
    });

    @Component({
      standalone: true,
      imports: [ EditorComponent, FormsModule ],
      template: `<editor [(ngModel)]="content" [disabled]="disabled" />`,
    })
    class EditorWithNgModelDynamicDisabled {
      public content = '<h1>Hello World</h1>';
      public disabled = true;
      @ViewChild(EditorComponent) public editorRef!: EditorComponent;
    }

    it('disabled property should toggle correctly with [ngModel]', async () => {
      await TestBed.configureTestingModule({
        imports: [ EditorWithNgModelDynamicDisabled ]
      }).compileComponents();

      const fixture = TestBed.createComponent(EditorWithNgModelDynamicDisabled);
      fixture.detectChanges();

      let tinyEditor = fixture.componentInstance.editorRef.editor;
      await Waiter.pTryUntil('Waited too long for editor to initialize', () => {
        Assertions.assertEq('Editor should exist', true, tinyEditor !== undefined);
        if (tinyEditor) {
          assertDisabled(tinyEditor, true);
        }
      });

      fixture.componentInstance.disabled = false;
      fixture.detectChanges();
      await Waiter.pTryUntil('Waited too long for mode change', () => {
        tinyEditor = fixture.componentInstance.editorRef.editor;
        if (tinyEditor) {
          assertDesignMode(tinyEditor);
        }
      });

      fixture.componentInstance.disabled = true;
      fixture.detectChanges();
      await Waiter.pTryUntil('Waited too long for mode change', () => {
        tinyEditor = fixture.componentInstance.editorRef.editor;
        if (tinyEditor) {
          assertDisabled(tinyEditor, true);
        }
      });
    });
  });
});
