import { EventEmitter } from '@angular/core';
import { fromEvent, Subject, takeUntil } from 'rxjs';
import { HasEventTargetAddRemove } from 'rxjs/internal/observable/fromEvent';

import { EditorComponent } from '../editor/editor.component';
import { Events } from '../editor/Events';
import { validEvents } from '@hugerte/framework-integration-shared';

// Caretaker note: `fromEvent` supports passing JQuery-style event targets, the editor has `on` and `off` methods which
// will be invoked upon subscription and teardown.
const listenHugeRTEEvent = (
  editor: any,
  eventName: string,
  destroy$: Subject<void>
) => fromEvent(editor as HasEventTargetAddRemove<unknown> | ArrayLike<HasEventTargetAddRemove<unknown>>, eventName).pipe(takeUntil(destroy$));

const bindHandlers = (ctx: EditorComponent, editor: any, destroy$: Subject<void>): void => {
  const allowedEvents = getValidEvents(ctx);
  allowedEvents.forEach((eventName) => {
    const eventEmitter: EventEmitter<any> = ctx[eventName];

    listenHugeRTEEvent(editor, eventName.substring(2), destroy$).subscribe((event) => {
      // Caretaker note: `ngZone.run()` runs change detection since it notifies the forked Angular zone that it's
      // being re-entered. We don't want to run `ApplicationRef.tick()` if anyone listens to the specific event
      // within the template. E.g. if the `onSelectionChange` is not listened within the template like:
      // `<editor (onSelectionChange)="..."></editor>`
      // then it won't be "observed", and we won't run "dead" change detection.
      if (isObserved(eventEmitter)) {
        ctx.ngZone.run(() => eventEmitter.emit({ event, editor }));
      }
    });
  });
};

const getValidEvents = (ctx: EditorComponent): (keyof Events)[] => {
  const ignoredEvents = parseStringProperty(ctx.ignoreEvents, []);
  const prefixedValidEvents = validEvents.map((event) => 'on' + event) as (keyof Events)[];
  prefixedValidEvents.push('onInitNgModel');
  prefixedValidEvents.push('onPreInit'); // TODO
  const allowedEvents = parseStringProperty(ctx.allowedEvents, prefixedValidEvents).filter(
    (event) => prefixedValidEvents.includes(event as (keyof Events)) && !ignoredEvents.includes(event)) as (keyof Events)[];
  return allowedEvents;
};

const parseStringProperty = (property: string | string[] | undefined, defaultValue: (keyof Events)[]): string[] => {
  if ( typeof property === 'string') {
    return property.split(',').map((value) => value.trim());
  }
  if ( Array.isArray(property)) {
    return property;
  }
  return defaultValue;
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop: (...args: any[]) => void = () => { };

const isNullOrUndefined = (value: any): value is null | undefined => value === null || value === undefined;

const isObserved = (o: Subject<unknown>): boolean =>
  // RXJS is making the `observers` property internal in v8. So this is intended as a backwards compatible way of
  // checking if a subject has observers.
  o.observed || o.observers?.length > 0;

export {
  listenHugeRTEEvent,
  bindHandlers,
  noop,
  isNullOrUndefined
};
