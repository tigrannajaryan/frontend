import { Component, Input } from '@angular/core';
import { formatNumber } from 'libphonenumber-js';

import { ExternalAppService } from '~/shared/utils/external-app-service';
import { NumberFormat } from '~/shared/directives/phone-input.directive';

function getLocalNumber(phone: string): string {
  if (/^\+1\s/.test(phone)) {
    // Show local number if US:
    return phone.replace(/^\+1\s/, '').replace(/\s/g, '-');
  }
  return phone;
}

@Component({
  selector: 'phone-link',
  templateUrl: 'phone-link.component.html'
})
export class PhoneLinkComponent {
  @Input() phone: string;
  @Input() readonly = false;
  @Input() shortForm = true;
  @Input() icon?: string;

  constructor(
    private externalAppService: ExternalAppService
  ) {
  }

  async onClick(): Promise<void> {
    if (!this.readonly) {
      this.externalAppService.doPhoneCall(this.phone);
    }
  }

  getFormattedPhone(): string {
    const phone = formatNumber(this.phone, NumberFormat.International);
    if (this.shortForm) {
      return getLocalNumber(phone);
    }
    return phone;
  }
}
