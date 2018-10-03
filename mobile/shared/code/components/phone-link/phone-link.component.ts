import { Component, Input } from '@angular/core';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { formatNumber } from 'libphonenumber-js';

import { NumberFormat } from '~/shared/directives/phone-input.directive';

@Component({
  selector: 'phone-link',
  templateUrl: 'phone-link.component.html'
})
export class PhoneLinkComponent {
  @Input() phone: string;
  @Input() readonly = false;

  isSupported: Promise<boolean>;

  constructor(
    private browser: InAppBrowser
  ) {
  }

  async onClick(): Promise<void> {
    const page = this.browser.create(`tel:${this.phone}`);
    page.show();
  }

  getFormattedPhone(): string {
    return formatNumber(this.phone, NumberFormat.International);
  }
}
