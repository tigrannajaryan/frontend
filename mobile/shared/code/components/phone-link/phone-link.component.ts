import { Component, Input } from '@angular/core';

import { ExternalAppService } from '~/shared/utils/external-app-service';
import { getPhoneNumber } from '~/shared/utils/phone-numbers';
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
    return this.shortForm ? getPhoneNumber(this.phone) : getPhoneNumber(this.phone, NumberFormat.International);
  }
}
