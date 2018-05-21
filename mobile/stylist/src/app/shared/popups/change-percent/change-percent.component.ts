import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

export interface ChangePercent {
  label: string;
  percentage: number;
}

@IonicPage()
@Component({
  selector: 'change-percent',
  templateUrl: 'change-percent.component.html'
})
export class ChangePercentComponent implements AfterViewInit {
  @ViewChild('scrollBar') scrollBar: ElementRef;
  data: ChangePercent;
  percentage = 0;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController
  ) {
  }

  /**
   * AfterViewInit - generate lines for scroll bar
   */
  ngAfterViewInit(): void {
    this.init();
  }

  init(): void {
    this.data = this.navParams.get('data') as ChangePercent;
    this.percentage = this.data.percentage;
  }

  dismiss(): void {
    this.viewCtrl.dismiss();
  }

  save(): void {
    this.viewCtrl.dismiss(this.percentage || 0);
  }
}
