import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';

import { ServiceModel } from '~/shared/api/price.models';

import { BookingData } from '~/core/api/booking.data';
import { PageNames } from '~/core/page-names';

import { ServicesCategoriesParams } from '~/services-categories-page/services-categories-page.component';
import { PricingHint } from '~/shared/components/services-header-list/services-header-list';

/**
 * A component that shows the list of services in the header
 * during booking process.
 */
@Component({
  selector: 'book-services-header',
  templateUrl: 'book-services-header.html'
})
export class BookServicesHeaderComponent {
  @Input() readonly: boolean;
  @Input() hints: PricingHint[];

  @Input()
  services: Observable<ServiceModel[]>;

  @Output() serviceChange = new EventEmitter();

  constructor(
    private bookingData: BookingData,
    private navCtrl: NavController
  ) {
    this.services = bookingData.selectedServicesObservable;
  }

  onDelete(service: ServiceModel): void {
    this.bookingData.deleteService(service);
    this.serviceChange.emit();
  }

  onAdd(): void {
    const { stylist } = this.bookingData;
    const params: ServicesCategoriesParams = {
      isAdditionalService: this.bookingData.selectedServices.length > 0,
      stylistUuid: stylist.uuid
    };

    this.navCtrl.push(PageNames.ServicesCategories, { params });
    this.serviceChange.emit();
  }
}
