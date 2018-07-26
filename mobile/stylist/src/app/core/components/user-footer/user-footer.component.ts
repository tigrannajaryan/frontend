import { Component } from '@angular/core';
import { NavController, ViewController } from 'ionic-angular';
import { Observable, Subscription } from 'rxjs';

import { PageNames } from '~/core/page-names';

@Component({
  selector: '[madeUserFooter]',
  templateUrl: 'user-footer.component.html'
})
export class UserFooterComponent {
  protected activePage: PageNames;
  protected PageNames = PageNames;
  private subscription: Subscription;

  constructor(private navCtrl: NavController) {
    this.subscription = Observable.merge(
      this.navCtrl.viewDidLoad,
      this.navCtrl.viewDidEnter
    ).subscribe((e: ViewController) => {
      this.activePage = e.name as PageNames;
    });
  }

  ionViewDidLeave(): void {
    this.subscription.unsubscribe();
  }
}
