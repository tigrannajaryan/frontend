import { Component, Input } from '@angular/core';
import { ModalController } from 'ionic-angular';
import { GalleryModal } from 'ionic-gallery-modal';

import { StylistProfileApi } from '~/shared/api/stylist-profile.api';
import { InstagramMedia, StylistUuidModel } from '~/shared/api/stylists.models';

@Component({
  selector: 'instagram-gallery',
  templateUrl: 'instagram-gallery.component.html'
})
export class InstagramGalleryComponent {
  Array = Array;
  Math = Math;

  mediaObjects: InstagramMedia[];

  @Input() set stylist(stylist: StylistUuidModel) {
    this.loadInstagramImages(stylist);
  }

  constructor(
    private modalCtrl: ModalController,
    private stylistApi: StylistProfileApi
  ) {
  }

  openImageModal(initialSlide = 0): void {
    const modal = this.modalCtrl.create(GalleryModal, {
      photos: this.mediaObjects.map(media => ({
        url: media.images.standard_resolution.url
      })),
      initialSlide,
      closeIcon: 'ios-close'
    });
    modal.present();
  }

  private async loadInstagramImages(stylist: StylistUuidModel): Promise<void> {
    const { response } = await this.stylistApi.getStylistInstagramImages(stylist).toPromise();
    if (response) {
      this.mediaObjects = response.instagram_media;
    }
  }
}
