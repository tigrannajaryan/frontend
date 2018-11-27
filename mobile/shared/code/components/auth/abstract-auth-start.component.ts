import { NavController } from 'ionic-angular';

import { AuthDataStore } from '~/shared/storage/auth.data';
import { PhoneData } from '~/shared/components/phone-input/phone-input.component';
import { loading } from '~/shared/utils/loading';

import { PageNames } from '~/core/page-names'; // resolved relatively

import { AuthConfirmParams } from './abstract-auth-confirm.component';

export abstract class AbstractAuthStartComponent {
  phone: string;

  isLoading = false;
  isDisabled = true;

  protected abstract auth: AuthDataStore;
  protected abstract navCtrl: NavController;

  onPhoneChange(phoneData: PhoneData): void {
    const { phone, valid } = phoneData;

    this.phone = phone;
    this.isDisabled = !valid;
  }

  async submit(): Promise<void> {
    const { response } = await loading(this, this.auth.getCode(this.phone));

    if (response) {
      const params: AuthConfirmParams = { phone: this.phone };
      this.navCtrl.push(PageNames.AuthConfirm, { params });
    }
  }
}
