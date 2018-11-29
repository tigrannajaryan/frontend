import { Component, OnInit, ViewChild } from '@angular/core';
import { Navbar, NavParams } from 'ionic-angular';

import { PushNotification } from '~/shared/push/push-notification';

export interface PushPrimingScreenParams {
  onContinue: Function;
}

@Component({
  selector: 'push-priming-screen',
  templateUrl: 'push-priming-screen.component.html'
})
export class PushPrimingScreenComponent implements OnInit {

  @ViewChild(Navbar) navBar: Navbar;

  private params: PushPrimingScreenParams;

  constructor(
    private navParams: NavParams,
    private pushNotification: PushNotification
  ) {
  }

  ngOnInit(): void {
    this.params = this.navParams.get('params') || {};
  }

  ionViewDidLoad(): void {
    this.pushNotification.refreshLastPrimingScreenShowTime();
  }

  async onAllowClick(): Promise<void> {
    await this.pushNotification.getSystemPermissionAndRegister();
    if (this.params.onContinue) {
      this.params.onContinue();
    }
  }

  onNotNowClick(): void {
    if (this.params.onContinue) {
      this.params.onContinue();
    }
  }
}
