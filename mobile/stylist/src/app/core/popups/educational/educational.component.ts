import { Component, ViewChild } from '@angular/core';
import { Slides, ViewController } from 'ionic-angular';
import { StylistAppStorage } from '~/core/stylist-app-storage';

@Component({
  selector: 'educational-popup',
  templateUrl: 'educational.component.html'
})
export class EducationalComponent {
  @ViewChild(Slides) slides: Slides;
  isPagerVisible = true;

  constructor(
    public viewCtrl: ViewController,
    private storage: StylistAppStorage
  ) {
  }

  dismiss(): void {
    this.storage.set('hasSeenEducationalPopups', true);
    this.viewCtrl.dismiss();
  }
}
