import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'pop-confirm-checkout',
  templateUrl: 'confirm-checkout.component.html'
})
export class ConfirmCheckoutComponent {

  constructor(
    protected navCtrl: NavController
  ) {
  }
}
