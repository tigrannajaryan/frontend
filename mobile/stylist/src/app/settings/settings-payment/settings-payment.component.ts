import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'settings-payment',
  templateUrl: 'settings-payment.component.html'
})
export class SettingsPaymentComponent {
  @Output() addPayment = new EventEmitter<void>();

  onAddPayment(): void {
    this.addPayment.emit();
  }
}
