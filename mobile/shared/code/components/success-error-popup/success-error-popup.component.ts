import { Component, OnInit } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';

export interface SuccessErrorPopupParams {
  isSuccess: boolean;
  title: string;
  message: string;
  dismissText?: string; // default 'Dismiss'
  onDidDismiss?(): void | Promise<void>;
}

/**
 * Unified component which shows success or error fullscreen popup, use:
 * |  const popup = this.modalCtrl.create(SuccessErrorPopupComponent, { params: SuccessErrorPopupParams });
 * |  popup.present();
 */
@Component({
  selector: 'success-error-popup',
  templateUrl: 'success-error-popup.component.html'
})
export class SuccessErrorPopupComponent implements OnInit {
  params: SuccessErrorPopupParams;

  constructor(
    private navParams: NavParams,
    private viewCtrl: ViewController
  ) {
  }

  ngOnInit(): void {
    const navParams = (this.navParams.get('params') || {}) as SuccessErrorPopupParams;
    this.params = {
      // Defaults:
      dismissText: 'Dismiss',
      // Extended by:
      ...navParams
    };
  }

  async onDismiss(): Promise<void> {
    await this.viewCtrl.dismiss();
    if (this.params.onDidDismiss) {
      this.params.onDidDismiss();
    }
  }
}
