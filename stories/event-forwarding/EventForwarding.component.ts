/* eslint-disable no-console */
import { Component } from '@angular/core';

@Component({
  selector: 'event-forwarding',
  templateUrl: './EventForwarding.component.html',
  standalone: false
})
export class EventForwardingComponent {
  public allowed = [ 'onMouseLeave', 'onMouseEnter' ];
  public ignore = [ 'onMouseLeave' ];
  public fieldValue = 'some value';
  public initObject = {
    height: 260,
  };

  public logMouseEnter() {
    console.log('Log mouse enter');
  }

  public logMouseLeave() {
    console.log('Log mouse leave');
  }
}
