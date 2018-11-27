import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AlertController, Events, NavController } from 'ionic-angular';
import { LaunchNavigator } from '@ionic-native/launch-navigator';

import { StylistModel } from '~/shared/api/stylists.models';
import { ExternalAppService } from '~/shared/utils/external-app-service';

import { ClientEventTypes } from '~/core/client-event-types';
import { PageNames } from '~/core/page-names';

@Component({
  selector: 'stylist-card',
  templateUrl: 'stylist-card.component.html'
})
export class StylistCardComponent implements OnInit {
  @Input() stylist: StylistModel;
  @Input() isActive = false;
  @Input() isSearchCard = false;
  @Input() isMyStylist = false;
  @Input() enableRemove = false;

  @Output() openCard = new EventEmitter<StylistModel>();
  @Output() closeCard = new EventEmitter<StylistModel>();

  @Output() selectStylist = new EventEmitter<StylistModel>();
  @Output() removeStylist = new EventEmitter<StylistModel>();
  @Output() showCalendar = new EventEmitter<StylistModel>();

  constructor(
    private events: Events,
    private externalAppService: ExternalAppService,
    private launchNavigator: LaunchNavigator,
    private navCtrl: NavController,
    private alertCtrl: AlertController
  ) {
  }

  ngOnInit(): void {
    if (!this.stylist) {
      throw new Error('Stylist is not provided in StylistCardComponent.');
    }
  }

  onCardOpen(): void {
    this.openCard.emit(this.stylist);
  }

  onCardClose(event: Event): void {
    this.closeCard.emit(this.stylist);

    // Disallow card re-open:
    event.stopPropagation();
  }

  onFollowersClick(): void {
    if (this.isActive) {
      this.navCtrl.push(PageNames.Followers, { stylist: this.stylist });
    }
  }

  onAddressClick(): void {
    this.externalAppService.openAddress(this.launchNavigator, this.stylist.salon_address);
  }

  onInstagramClick(): void {
    this.externalAppService.openInstagram(this.stylist.instagram_url);
  }

  onWebsiteClick(): void {
    this.externalAppService.openWebPage(this.stylist.website_url);
  }

  onShowCalendar(): void {
    this.stylist.is_profile_preferred = true;
    this.showCalendar.emit(this.stylist);
  }

  onSelectStylist(): void {
    this.selectStylist.emit(this.stylist);
  }

  onRemoveStylist(): void {
    const popup = this.alertCtrl.create({
      title: 'Are you sure you want to remove this stylist?',
      buttons: [{
        text: 'Cancel',
        role: 'cancel'
      }, {
        text: 'Yes, Remove',
        handler: () => {
          setTimeout(async () => {
            this.removeStylist.emit(this.stylist);
          });
        }
      }]
    });
    popup.present();
  }

  onStartBooking(): void {
    // defensive check
    if (this.canStartBooking()) {
      return;
    }

    this.events.publish(ClientEventTypes.startBooking, this.stylist.uuid);
  }

  /**
   * We can start booking process on avatar click only on my stylists tab and if a prime stylist
   */
  canStartBooking(): boolean {
    return this.isActive && !this.isSearchCard && this.stylist.is_profile_bookable;
  }
}
