import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'discounts-change',
  templateUrl: 'discounts-change.component.html'
})
export class DiscountsChangeComponent implements AfterViewInit {
  @ViewChild('scrollBar') scrollBar: ElementRef;
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
    this.generateLines();
    this.init();
  }

  init(): void {
    this.setPercentage(this.navParams.get('data'));
  }

  dismiss(): void {
    this.viewCtrl.dismiss();
  }

  onSwipe(): void {
    const el = this.scrollBar.nativeElement.parentNode;

    const scrollPercentage = el.scrollLeft / (el.scrollWidth - el.clientWidth) * 100;

    this.percentage = +scrollPercentage.toFixed();
  }

  setPercentage(percentage: number): void {
    const el = this.scrollBar.nativeElement.parentNode;

    el.scrollLeft = (el.scrollWidth - el.clientWidth) * (percentage / 100);

    this.percentage = percentage;
  }

  generateLines(): void {
    const lines = 20;
    const itemClass = `${this.scrollBar.nativeElement.className}-item`;

    for (let i = 0; i < lines; i++) {
      const para = document.createElement('i');
      para.className = itemClass;
      this.scrollBar.nativeElement.appendChild(para);
    }
  }

  save(): void {
    this.viewCtrl.dismiss(this.percentage || 0);
  }
}
