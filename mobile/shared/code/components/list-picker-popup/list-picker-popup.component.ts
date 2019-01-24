import { Component, OnInit } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';

export interface ListPickerOption { // similar to HTML’s option
  label: string;
  value: any;
  selected?: boolean;
  disabled?: boolean;
}

export interface ListPickerPopupParams {
  options: ListPickerOption[];
  title?: string;
  onSelect(option: ListPickerOption): void | Promise<void>;
}

/**
 * Unified component which shows a list of choices to select one:
 * |  const popup = this.modalCtrl.create(ListPickerPopupComponent, { params: ListPickerPopupParams });
 * |  popup.present();
 */
@Component({
  selector: 'list-picker-popup',
  templateUrl: 'list-picker-popup.component.html'
})
export class ListPickerPopupComponent implements OnInit {
  static beforeCloseDelayMs = 200;

  params: ListPickerPopupParams;

  constructor(
    private navParams: NavParams,
    private viewCtrl: ViewController
  ) {
  }

  ngOnInit(): void {
    this.params = (this.navParams.get('params') || {}) as ListPickerPopupParams;
  }

  onSelect(option: ListPickerOption): void {
    this.params.onSelect(option);
    setTimeout(() => {
      this.onDismiss();
    }, ListPickerPopupComponent.beforeCloseDelayMs);
  }

  async onDismiss(): Promise<void> {
    await this.viewCtrl.dismiss();
  }
}
