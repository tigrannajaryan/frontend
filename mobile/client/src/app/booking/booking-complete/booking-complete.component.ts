import { Component } from '@angular/core';
import { Events, NavController } from 'ionic-angular';

import { ClientEventTypes } from '~/core/client-event-types';
import { TabIndex } from '~/main-tabs/main-tabs.component';

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
    this.events.publish(ClientEventTypes.selectMainTab, TabIndex.Home);
  }
}
