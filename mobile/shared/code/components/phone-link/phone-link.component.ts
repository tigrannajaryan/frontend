import { Component, Input } from '@angular/core';
import { formatNumber } from 'libphonenumber-js';

import { ExternalAppService } from '~/shared/utils/external-app-service';
import { getLocalNumber } from '~/shared/utils/phone-numbers';
import { NumberFormat } from '~/shared/directives/phone-input.directive';

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
    return this.shortForm ? getLocalNumber(phone) : phone;
  }
}
