import { Component, ViewChild } from '@angular/core';
import { Events, Navbar } from 'ionic-angular';

import { PushNotification } from '~/shared/push/push-notification';
import { SharedEventTypes } from '~/shared/events/shared-event-types';

@Component({
  selector: 'push-priming-screen',
  templateUrl: 'push-priming-screen.component.html'
})
export class PushPrimingScreenComponent {

  @ViewChild(Navbar) navBar: Navbar;

  constructor(
    private events: Events,
    private pushNotification: PushNotification
  ) {}

  ionViewDidLoad(): void {
    this.pushNotification.refreshLastPrimingScreenShowTime();
  }

  async onAllowClick(): Promise<void> {
    await this.pushNotification.getSystemPermissionAndRegister();
    this.events.publish(SharedEventTypes.continueAfterPushPriming);
  }

  onNotNowClick(): void {
    this.events.publish(SharedEventTypes.continueAfterPushPriming);
  }
}
