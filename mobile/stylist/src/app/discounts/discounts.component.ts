import { Component } from '@angular/core';
import { AlertController, IonicPage, ModalController, NavController, NavParams } from 'ionic-angular';
import { DiscountsApi } from './discounts.api';
import { Discounts } from './discounts.models';
import { PageNames } from '~/core/page-names';
import { ChangePercent } from '~/core/popups/change-percent/change-percent.component';
import { loading } from '~/core/utils/loading';

export enum DiscountsTypes {
  weekday = 'weekday',
  first_booking = 'first_booking',
  rebook_within_1_week = 'rebook_within_1_week',
  rebook_within_2_weeks = 'rebook_within_2_weeks'
}

@IonicPage({
  segment: 'discounts'
})
@Component({
  selector: 'page-discounts',
  templateUrl: 'discounts.component.html'
})
export class DiscountsComponent {
  // this should be here if we using enum in html
  protected DiscountsTypes = DiscountsTypes;
  protected PageNames = PageNames;

  discounts: Discounts;
  isProfile?: Boolean;

  constructor(
    private alertCtrl: AlertController,
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public discountsApi: DiscountsApi
    ) {
  }

  ionViewWillLoad(): void {
    this.isProfile = Boolean(this.navParams.get('isProfile'));
    this.loadInitialData();
  }

  @loading
  async loadInitialData(): Promise<void> {
    try {
      const discounts = await this.discountsApi.getDiscounts() as Discounts;
      this.discounts = {
        ...discounts,
        weekdays: discounts.weekdays.sort((a, b) => a.weekday - b.weekday) // from 1 (Monday) to 7 (Sunday)
      };
    } catch (e) {
      const alert = this.alertCtrl.create({
        title: 'Loading discounts failed',
        subTitle: e.message,
        buttons: ['Dismiss']
      });
      alert.present();
    }
  }

  /**
   * Check if we have at least one value with percent > 0
   */
  hasDiscounts(): boolean {
    for (const key in this.discounts) {
      if (this.discounts.hasOwnProperty(key)) {

        if (Array.isArray(this.discounts[key])) {
          for (const weekday of this.discounts[key]) {
            if (weekday.discount_percent > 0) { return true; }
          }
        } else {
          if (this.discounts[key] > 0) { return true; }
        }
      }
    }

    return false;
  }

  /**
   * Open modal where we can change percent of any item
   * @param type - type of key
   * @param index - if array of weekdays
   * @param verbose - verbose name if not array
   */
  onDiscountChange(type: DiscountsTypes, index?: number, verbose?: string): void {
    let data: ChangePercent;

    if (type === DiscountsTypes.weekday) {
      data = {
        label: this.discounts.weekdays[index].weekday_verbose,
        percentage: this.discounts.weekdays[index].discount_percent
      };
    } else {
      data = {
        label: verbose,
        percentage: this.discounts[type]
      };
    }

    const modal = this.modalCtrl.create(PageNames.ChangePercent, { data });
    modal.onDidDismiss((res: number) => {
      if (isNaN(res)) { return; }

      if (type === 'weekday') {
        this.discounts.weekdays[index].discount_percent = res;
      } else {
        this.discounts[type] = res;
      }
    });
    modal.present();
  }

  nextRoute(): void {
    if (this.isProfile) {
      this.navCtrl.pop();
      return;
    }

    this.navCtrl.setRoot(PageNames.Profile, {}, { animate: false });
  }

  /**
   * Clean up the data before save,
   * show alert if we have no discounts,
   * save data on server
   */
  saveDiscounts(): void {
    if (!this.hasDiscounts()) { // TODO: use promise and one-directional flow
      const modal = this.modalCtrl.create(PageNames.DiscountsAlert);
      modal.onDidDismiss((confirmNoDiscount: boolean) => {
        if (confirmNoDiscount) {
          this.discountsApi.setDiscounts(this.discounts);
          this.nextRoute();
        }
      });
      modal.present();

      return;
    }

    this.discountsApi.setDiscounts(this.discounts);
    this.nextRoute();
  }
}
