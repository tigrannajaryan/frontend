import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';

@Component({
  selector: 'discounts-alert',
  templateUrl: 'discounts-alert.component.html'
})
export class DiscountsAlertComponent {

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController
  ) {
  }

  close(confirmNoDiscount: boolean): void {
    this.viewCtrl.dismiss(confirmNoDiscount);
  }
}
