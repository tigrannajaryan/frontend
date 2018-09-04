import { Component } from '@angular/core';
import { Events, IonicPage, NavController } from 'ionic-angular';

import { EventTypes } from '~/core/event-types';
import { TabIndex } from '~/main-tabs/main-tabs.component';

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
    this.events.publish(EventTypes.selectMainTab, TabIndex.Home);
  }
}
