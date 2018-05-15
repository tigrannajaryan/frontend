import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

@IonicPage()
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
