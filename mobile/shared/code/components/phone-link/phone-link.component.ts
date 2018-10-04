import { Component, Input } from '@angular/core';
import { formatNumber } from 'libphonenumber-js';

import { ExternalAppService } from '~/shared/utils/external-app-service';
import { NumberFormat } from '~/shared/directives/phone-input.directive';

@Component({
  selector: 'phone-link',
  templateUrl: 'phone-link.component.html'
})
export class PhoneLinkComponent {
  @Input() phone: string;
  @Input() readonly = false;

  constructor(
    private externalAppService: ExternalAppService
  ) {
  }

  async onClick(): Promise<void> {
    this.externalAppService.doPhoneCall(this.phone);
  }

  getFormattedPhone(): string {
    return formatNumber(this.phone, NumberFormat.International);
  }
}
