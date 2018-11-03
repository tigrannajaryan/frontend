import { Component, ViewChild } from '@angular/core';
import { Navbar, NavParams } from 'ionic-angular';

import { PrimingScreenParams } from '~/shared/push/push-notification';

@Component({
  selector: 'push-priming-screen',
  templateUrl: 'push-priming-screen.component.html'
})
export class PushPrimingScreenComponent {

  @ViewChild(Navbar) navBar: Navbar;

  params: PrimingScreenParams;

  constructor(navParams: NavParams) {
    this.params = navParams.get('params');
  }

  ionViewDidLoad(): void {
    const oldBackHandler = this.navBar.backButtonClick;
    this.navBar.backButtonClick = (e: UIEvent) => {
      oldBackHandler.call(this.navBar, e);
      this.params.onBackClick();
    };
  }

  onAllowClick(): void {
    this.params.onAllowClick();
  }

  onNotNowClick(): void {
    this.params.onNotNowClick();
  }
}
