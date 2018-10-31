import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NavController } from 'ionic-angular';

import { StylistModel } from '~/shared/api/stylists.models';
import { ExternalAppService } from '~/shared/utils/external-app-service';

import { PageNames } from '~/core/page-names';

@Component({
  selector: 'stylist-card',
  templateUrl: 'stylist-card.component.html'
})
export class StylistCardComponent implements OnInit {
  @Input() stylist: StylistModel;
  @Input() isActive = false;

  @Output() openCard = new EventEmitter<StylistModel>();
  @Output() closeCard = new EventEmitter<StylistModel>();

  @Output() selectStylist = new EventEmitter<StylistModel>();

  constructor(
    private externalAppService: ExternalAppService,
    private navCtrl: NavController
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

  onInstagramClick(): void {
    this.externalAppService.openInstagram(this.stylist.instagram_url);
  }

  onWebsiteClick(): void {
    this.externalAppService.openWebPage(this.stylist.website_url);
  }

  onSelectStylist(): void {
    this.selectStylist.emit(this.stylist);
  }
}
