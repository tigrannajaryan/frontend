import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';

@IonicPage({
  segment: 'today'
})
@Component({
  selector: 'page-today',
  templateUrl: 'today.component.html'
})
export class TodayComponent {

  constructor(public navCtrl: NavController) {

  }

}
