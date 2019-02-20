import { Component, OnInit } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { Logger } from '~/shared/logger';
import { showAlert } from '~/shared/utils/alert';
import { InstagramOAuthService } from '~/shared/oauth/instagram-oauth-service';

import { ENV } from '~/environments/environment.default';

import { StylistServiceProvider } from '~/core/api/stylist.service';
import { PageNames } from '~/core/page-names';
import { MadeDisableOnClick } from '~/shared/utils/loading';

export interface ConnectInstagramComponentParams {
  isRootPage?: boolean;
}

@Component({
  selector: 'connect-instagram',
  templateUrl: 'connect-instagram.component.html'
})
export class ConnectInstagramComponent implements OnInit {
  params: ConnectInstagramComponentParams;

  connected = false;
  token: string;

  constructor(
    private api: StylistServiceProvider,
    private instagram: InstagramOAuthService,
    private logger: Logger,
    private navCtrl: NavController,
    private navParams: NavParams
  ) {
  }

  ngOnInit(): void {
    this.params = this.navParams.get('params') || {};
  }

  @MadeDisableOnClick
  async onNavigateNext(): Promise<void> {
    if (!this.params.isRootPage) {
      await this.navCtrl.push(PageNames.StylistPhoto);
    } else {
      await this.navCtrl.popToRoot();
    }
  }

  @MadeDisableOnClick
  async onContinue(): Promise<void> {
    await this.connect();

    if (this.connected) {
      await this.onNavigateNext();
    }
  }

  private async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    const token = await this.instagram.auth(ENV.INSTAGRAM_CLIENT_ID).catch(error => {
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
