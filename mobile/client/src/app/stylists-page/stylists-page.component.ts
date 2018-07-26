import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { PageNames } from '~/core/page-names';

import { StylistModel } from '~/core/api/stylists.models';
import {
  SearchStylistsAction,
  selectStylists,
  StylistState
} from '~/core/reducers/stylists.reducer';

@IonicPage()
@Component({
  selector: 'page-stylists',
  templateUrl: 'stylists-page.component.html'
})
export class StylistsPageComponent {
  stylists: Observable<StylistModel[]>;

  activeStylist?: StylistModel;

  constructor(
    private navCtrl: NavController,
    private store: Store<StylistState>
  ) {
  }

  ionViewWillEnter(): void {
    this.stylists = this.store.select(selectStylists);

    this.store.dispatch(new SearchStylistsAction());
  }

  setActiveStylist(event: Event, stylist: StylistModel | undefined): void {
    this.activeStylist = stylist;
    event.stopPropagation();
  }

  continueWithStylist(stylist: StylistModel): void {
    // TODO: uncomment after adding services pages
    // this.navCtrl.push(PageNames.Categories, { stylistUuid: stylist.uuid });
  }
}
