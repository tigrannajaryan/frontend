import { Component, OnInit } from '@angular/core';
import { App, Events, NavParams, ViewController } from 'ionic-angular';

import { StylistModel } from '~/shared/api/stylists.models';
import { ClientEventTypes } from '~/core/client-event-types';
import { MyStylistsTabs } from '~/stylists/my-stylists.component';
import { MainTabIndex } from '~/main-tabs/main-tabs.component';

export interface NonBookableSavePopupParams {
  stylist: StylistModel;
}

@Component({
  selector: 'non-bookable-save-popup',
  templateUrl: 'non-bookable-save-popup.component.html'
})
export class NonBookableSavePopupComponent implements OnInit {
  static cssClass = 'NonBookableSavePopup';

  stylist: StylistModel;

  constructor(
    private app: App,
    private events: Events,
    private navParams: NavParams,
    private viewCtrl: ViewController
  ) {
  }

  ngOnInit(): void {
    const { stylist } = (this.navParams.get('params') || {}) as NonBookableSavePopupParams;
    this.stylist = stylist;
  }

  onClose(): void {
    this.viewCtrl.dismiss();
  }

  async onRedirectToSavedStylists(): Promise<void> {
    this.onClose();
    await this.app.getRootNav().popToRoot();
    this.events.publish(ClientEventTypes.selectMainTab, MainTabIndex.Stylists);
    this.events.publish(ClientEventTypes.selectStylistTab, MyStylistsTabs.savedStylists);
  }
}
