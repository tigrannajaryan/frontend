import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ModalController } from 'ionic-angular';

import { PageNames } from '~/core/page-names';
import { PercentageSliderSettings } from '~/core/popups/change-percent/change-percent.component';
import { FirstBooking } from '~/discounts/discounts-first-booking/discounts-first-booking.component';

@Component({
  selector: 'discounts-first-booking-short',
  templateUrl: 'discounts-first-booking-short.component.html'
})
export class DiscountsFirstBookingShortComponent {
  @Input() firstBooking: FirstBooking;
  @Output() firstVisitChange = new EventEmitter();

  constructor(
    private modalCtrl: ModalController
  ) {}

  onDiscountChange(): void {
    const data: PercentageSliderSettings = this.firstBooking;

    const modal = this.modalCtrl.create(PageNames.ChangePercent, { data });
    modal.onDidDismiss((percent: number) => {
      if (isNaN(percent)) {
        return;
      }

      if (this.firstBooking.percentage !== percent) {
        this.firstBooking.percentage = percent;
        this.firstVisitChange.emit();
      }
    });
    modal.present();
  }
}
