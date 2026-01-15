/**
 * Copyright (c) 2022 Ephox Corporation DBA Tiny Technologies, Inc.
 * Copyright (c) 2025 HugeRTE contributors
 *
 * This file is part of the HugeRTE Angular integration.
 * Licensed under the MIT license.
 * See https://github.com/hugerte/hugerte-angular/blob/main/LICENSE.txt
 *
 */
/* eslint-disable @typescript-eslint/no-parameter-properties */
import { isPlatformBrowser, CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  forwardRef,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
  InjectionToken,
  Optional,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject, Observable, takeUntil } from 'rxjs';
import { getHugeRTE } from '../HugeRTE';
import { listenHugeRTEEvent, bindHandlers, noop, isNullOrUndefined } from '../utils/Utils';
import { EventObj, Events } from './Events';
import type { Editor as HugeRTEEditor, HugeRTE } from 'hugerte';
import { ScriptLoader, isTextarea, mergePlugins, uuid } from '@hugerte/framework-integration-shared';

type EditorOptions = Parameters<HugeRTE['init']>[0];

export const HUGERTE_SCRIPT_SRC = new InjectionToken<string>('HUGERTE_SCRIPT_SRC');

const EDITOR_COMPONENT_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => EditorComponent),
  multi: true
};

export type Version = `${'1'}${'' | `.${number}` | `.${number}.${number}`}`;

@Component({
  selector: 'editor',
  template: '',
  styles: [ ':host { display: block; }' ],
  providers: [ EDITOR_COMPONENT_VALUE_ACCESSOR ],
  standalone: true,
  imports: [ CommonModule, FormsModule ],
  changeDetection: ChangeDetectionStrategy.OnPush
})

/**
 * TODO add docs for inputs
 */
export class EditorComponent extends Events implements AfterViewInit, ControlValueAccessor, OnDestroy {

  @Input() public cdnVersion: Version = '1';
  @Input() public init?: EditorOptions;
  @Input() public id = '';
  @Input() public initialValue?: string;
  @Input() public outputFormat?: 'html' | 'text';
  @Input() public inline?: boolean;
  @Input() public tagName?: string;
  @Input() public plugins?: string;
  @Input() public toolbar?: string | string[];
  @Input() public modelEvents = 'change input undo redo';
  @Input() public allowedEvents?: string | string[];
  @Input() public ignoreEvents?: string | string[];
  @Input()
  public set disabled(val) {
    this._disabled = val;
    if (this._editor) {
      if (typeof this._editor.mode?.set === 'function') {
        this._editor.mode.set(val ? 'readonly' : 'design');
      } else if ('setMode' in this._editor && typeof this._editor.setMode === 'function') {
        this._editor.setMode(val ? 'readonly' : 'design');
      }
    }
  }

  public get disabled() {
    return this._disabled;
  }

  public get editor() {
    return this._editor;
  }

  public ngZone: NgZone;

  private _elementRef: ElementRef;
  private _element?: HTMLElement;
  private _disabled?: boolean;
  private _editor?: HugeRTEEditor;

  private onTouchedCallback = noop;
  private onChangeCallback: any;

  private destroy$ = new Subject<void>();

  public constructor(
    elementRef: ElementRef,
    ngZone: NgZone,
    private cdRef: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Optional() @Inject(HUGERTE_SCRIPT_SRC) private hugerteScriptSrc?: string
  ) {
    super();
    this._elementRef = elementRef;
    this.ngZone = ngZone;
  }

  public writeValue(value: string | null): void {
    if (this._editor && this._editor.initialized) {
      this._editor.setContent(isNullOrUndefined(value) ? '' : value);
    } else {
      this.initialValue = value === null ? undefined : value;
    }
  }

  public registerOnChange(fn: (_: any) => void): void {
    this.onChangeCallback = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouchedCallback = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  public ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.id = this.id || uuid('hugerte-angular');
      this.inline = this.inline !== undefined ? this.inline !== false : !!(this.init?.inline);
      this.createElement();
      if (getHugeRTE() !== null) {
        this.initialise();
      } else if (this._element && this._element.ownerDocument) {
        new Observable<void>((observer) => {
          ScriptLoader.load(this._element!.ownerDocument, this.getScriptSrc(), () => {
            observer.next();
            observer.complete();
          });
        })
        .pipe(takeUntil(this.destroy$))
        .subscribe(this.initialise);
      }
    }
  }

  public ngOnDestroy() {
    this.destroy$.next();

    this._editor && getHugeRTE()?.remove(this._editor);
  }

  public createElement() {
    const tagName = typeof this.tagName === 'string' ? this.tagName : 'div';
    this._element = document.createElement(this.inline ? tagName : 'textarea');
    if (this._element) {
      const existingElement = document.getElementById(this.id);
      if (existingElement && existingElement !== this._elementRef.nativeElement) {
        /* eslint no-console: ["error", { allow: ["warn"] }] */
        console.warn(`HugeRTE-Angular: an element with id [${this.id}] already exists. Editors with duplicate Id will not be able to mount`);
      }
      this._element.id = this.id;
      if (isTextarea(this._element)) {
        this._element.style.visibility = 'hidden';
      }
      this._elementRef.nativeElement.appendChild(this._element);
    }
  }

  public initialise = (): void => {
    const finalInit: EditorOptions = {
      ...this.init,
      selector: undefined,
      target: this._element,
      inline: this.inline,
      readonly: this.disabled,
      plugins: mergePlugins((this.init && this.init.plugins) as string, this.plugins),
      toolbar: this.toolbar || (this.init && this.init.toolbar),
      setup: (editor: HugeRTEEditor) => {
        this._editor = editor;

        listenHugeRTEEvent(editor, 'init', this.destroy$).subscribe(() => {
          this.initEditor(editor);
        });

        bindHandlers(this, editor, this.destroy$);

        if (this.init && typeof this.init.setup === 'function') {
          this.init.setup(editor);
        }
      }
    };

    if (isTextarea(this._element)) {
      this._element.style.visibility = '';
    }

    this.ngZone.runOutsideAngular(() => {
      getHugeRTE()?.init(finalInit);
    });
  };

  private getScriptSrc() {
    let src = isNullOrUndefined(this.hugerteScriptSrc) ?
      `https://cdn.jsdelivr.net/npm/hugerte@${this.cdnVersion}/hugerte.min.js` :
      this.hugerteScriptSrc;

    return src;
  }

  private initEditor(editor: HugeRTEEditor) {
    listenHugeRTEEvent(editor, 'blur', this.destroy$).subscribe(() => {
      this.cdRef.markForCheck();
      this.ngZone.run(() => this.onTouchedCallback());
    });

    listenHugeRTEEvent(editor, this.modelEvents, this.destroy$).subscribe(() => {
      this.cdRef.markForCheck();
      this.ngZone.run(() => this.emitOnChange(editor));
    });

    if (typeof this.initialValue === 'string') {
      this.ngZone.run(() => {
        editor.setContent(this.initialValue as string);
        if (editor.getContent() !== this.initialValue) {
          this.emitOnChange(editor);
        }
        if (this.onInitNgModel !== undefined) {
          this.onInitNgModel.emit(editor as unknown as EventObj<any>);
        }
      });
    }
  }

  private emitOnChange(editor: HugeRTEEditor) {
    if (this.onChangeCallback) {
      this.onChangeCallback(editor.getContent({ format: this.outputFormat }));
    }
  }
}
