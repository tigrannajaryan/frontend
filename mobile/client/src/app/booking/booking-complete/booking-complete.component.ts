import { Component } from '@angular/core';
import { Events, IonicPage, NavController } from 'ionic-angular';

import { EventTypes } from '~/core/event-types';

@IonicPage()
@Component({
  selector: 'page-booking-complete',
  templateUrl: 'booking-complete.component.html'
})
export class BookingCompleteComponent {
  constructor(
    private events: Events,
    private navCtrl: NavController) {
  }

  onReturnHomeClick(): void {
    this.navCtrl.popToRoot();
    this.events.publish(EventTypes.bookingComplete);
  }
}
