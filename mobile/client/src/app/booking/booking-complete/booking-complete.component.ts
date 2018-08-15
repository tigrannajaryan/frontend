import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-booking-complete',
  templateUrl: 'booking-complete.component.html'
})
export class BookingCompleteComponent {
  constructor(
    private navCtrl: NavController) {
  }

  onReturnHomeClick(): void {
    this.navCtrl.popToRoot();
  }
}
