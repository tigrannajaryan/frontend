import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { AuthService } from '~/shared/api/auth.api';
import { AbstractAuthStartComponent } from '~/shared/components/auth/abstract-auth-start.component';

@Component({
  selector: 'page-auth-start',
  templateUrl: 'auth-start.component.html'
})
export class AuthPageComponent extends AbstractAuthStartComponent {

  constructor(
    protected auth: AuthService,
    protected navCtrl: NavController
  ) {
    super();
  }
}
