import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';

export enum ChangePercentSymbols {
  percent = '%',
  usd = '$'
}

export interface PercentageSliderSettings {
  label: string;
  percentage: number;
  symbol?: string;
  min?: number;
  max?: number;
  step?: number;
}

@Component({
  selector: 'change-percent',
  templateUrl: 'change-percent.component.html'
})
export class ChangePercentComponent implements AfterViewInit {
  @ViewChild('scrollBar') scrollBar: ElementRef;
  protected ChangePercentSymbols = ChangePercentSymbols;
  protected data: PercentageSliderSettings;
  protected percentage = 0;

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
    this.data = this.navParams.get('data') as PercentageSliderSettings;

    this.data = {
      ...this.data,
      symbol: this.data.symbol || ChangePercentSymbols.percent,
      min: this.data.min || 0,
      max: this.data.max || 100,
      step: this.data.step || 1
    };

    this.percentage = this.data.percentage;
  }

  dismiss(): void {
    this.viewCtrl.dismiss();
  }

  save(): void {
    this.viewCtrl.dismiss(this.percentage || 0);
  }
}
