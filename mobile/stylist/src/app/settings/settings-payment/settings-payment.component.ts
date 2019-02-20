import { Component, EventEmitter, Output } from '@angular/core';
import { MadeDisableOnClick } from '~/shared/utils/loading';

@Component({
  selector: 'settings-payment',
  templateUrl: 'settings-payment.component.html'
})
export class SettingsPaymentComponent {
  @Output() addPayment = new EventEmitter<void>();

  @MadeDisableOnClick
  async onAddPayment(): Promise<void> {
    this.addPayment.emit();
  }
}
