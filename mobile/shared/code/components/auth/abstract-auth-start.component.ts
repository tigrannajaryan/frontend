import { ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';

import { AuthService } from '~/shared/api/auth.api';
import { PhoneData, PhoneInputComponent } from '~/shared/components/phone-input/phone-input.component';
import { loading, MadeDisableOnClick } from '~/shared/utils/loading';

import { PageNames } from '~/core/page-names'; // resolved relatively

import { AuthConfirmParams } from './abstract-auth-confirm.component';

export abstract class AbstractAuthStartComponent {
  phone: string;

  isLoading = false;
  isDisabled = true;

  protected auth: AuthService;
  protected navCtrl: NavController;

  @ViewChild(PhoneInputComponent) phoneInput: PhoneInputComponent;

  onPhoneChange(phoneData: PhoneData): void {
    const { phone, valid } = phoneData;

    this.phone = phone;
    this.isDisabled = !valid;
  }

  @MadeDisableOnClick
  async submit(): Promise<void> {
    const { response } = await loading(this, this.auth.getCode(this.phone));

    if (response) {
      const params: AuthConfirmParams = { phone: this.phone };
      await this.navCtrl.push(PageNames.AuthConfirm, { params });
    }
  }
}
