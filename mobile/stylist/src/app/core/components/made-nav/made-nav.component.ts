import { Component, Input } from '@angular/core';
import { NavController } from 'ionic-angular';

import { PageNames } from '~/core/page-names';

@Component({
  selector: 'made-nav',
  templateUrl: 'made-nav.component.html'
})
export class MadeNavComponent {
  protected nav = {
    left: [],
    active: '',
    right: []
  };
  @Input()
  set activePage(activePage: string) {
    for (const item of this.pages) {
      if (item.page === activePage) {
        this.nav.active = item.name;
      } else if (!this.nav.active) {
        this.nav.left.push(item);
      } else if (this.nav.active) {
        this.nav.right.push(item);
      }
    }
  }
  private pages = [
    { name: 'Personal Info', page: PageNames.RegisterSalon },
    { name: 'Services', page: PageNames.Services },
    { name: 'Worktime', page: PageNames.Worktime },

    { name: 'Discounts', page: PageNames.DiscountsInfo },
    { name: 'Weekdays', page: PageNames.DiscountsWeekday },
    { name: 'Revisit', page: PageNames.DiscountsRevisit },
    { name: 'First Visit', page: PageNames.DiscountsFirstBooking },

    { name: 'Invite Clients', page: PageNames.Invitations }
  ];

  constructor(public navCtrl: NavController) {
  }
}
