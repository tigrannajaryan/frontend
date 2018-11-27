import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { AbstractAuthStartComponent } from '~/shared/components/auth/abstract-auth-start.component';
import { AuthDataStore } from '~/shared/storage/auth.data';

@Component({
  selector: 'page-auth-start',
  templateUrl: 'auth-start.component.html'
})
export class AuthPageComponent extends AbstractAuthStartComponent {

  constructor(
    protected auth: AuthDataStore,
    protected navCtrl: NavController
  ) {
    super();
  }
}
