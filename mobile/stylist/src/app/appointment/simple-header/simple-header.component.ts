import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: '[madeSimpleHeader]',
  templateUrl: 'simple-header.component.html'
})
export class SimpleHeaderComponent {
  constructor(
    // tslint:disable-next-line:no-unused-variable
    private navCtrl: NavController
  ) {
  }
}
