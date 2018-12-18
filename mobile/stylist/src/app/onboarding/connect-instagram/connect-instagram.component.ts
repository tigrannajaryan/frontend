import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { Logger } from '~/shared/logger';
import { showAlert } from '~/shared/utils/alert';
import { InstagramOAuthService } from '~/shared/utils/instagram-oauth-service';

import { StylistServiceProvider } from '~/core/api/stylist.service';
import { PageNames } from '~/core/page-names';

@Component({
  selector: 'connect-instagram',
  templateUrl: 'connect-instagram.component.html'
})
export class ConnectInstagramComponent {
  connected = false;
  token: string;

  constructor(
    private api: StylistServiceProvider,
    private instagram: InstagramOAuthService,
    private logger: Logger,
    private navCtrl: NavController
  ) {
  }

  onNavigateNext(): void {
    this.navCtrl.push(PageNames.WelcomeToMade);
  }

  async onContinue(): Promise<void> {
    await this.connect();

    if (this.connected) {
      this.onNavigateNext();
    }
  }

  private async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    const token = await this.instagram.auth('417299d1d7ee4c67972fd7b62c8d5044').catch(error => {
      this.logger.error(error);
    });

    if (!token) {
      showAlert('', 'Unable to connect your instagram. Try again later.');
      return;
    }

    const { response } = await this.api.setInstagramAccessToken(token).toPromise();
    if (response) {
      this.connected = true;
    }
  }
}
