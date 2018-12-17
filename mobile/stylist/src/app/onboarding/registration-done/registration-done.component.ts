import { Component } from '@angular/core';
import { Events, NavController } from 'ionic-angular';

import { PageNames } from '~/core/page-names';
import { SetStylistProfileTabEventParams, StylistEventTypes } from '~/core/stylist-event-types';

import { ProfileTabs } from '~/profile/profile.component';

@Component({
  selector: 'registration-done',
  templateUrl: 'registration-done.component.html'
})
export class RegistrationDoneComponent {

  constructor(
    private events: Events,
    private navCtrl: NavController
  ) {}

  async onContinue(): Promise<void> {
    await this.navCtrl.setRoot(PageNames.Profile);
    this.events.publish(
      StylistEventTypes.setStylistProfileTab,
      { profileTab: ProfileTabs.clientView } as SetStylistProfileTabEventParams
    );
  }
}
