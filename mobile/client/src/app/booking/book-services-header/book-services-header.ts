import { Component, Input } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';

import { ServiceModel } from '~/shared/api/price.models';
import { BookingData } from '~/core/api/booking.data';
import { PageNames } from '~/core/page-names';

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

  @Input()
  services: Observable<ServiceModel[]>;

  constructor(
    private bookingData: BookingData,
    private navCtrl: NavController
  ) {
    this.services = bookingData.selectedServicesObservable;
  }

  onDelete(service: ServiceModel): void {
    this.bookingData.deleteService(service);
  }

  onAdd(): void {
    this.navCtrl.push(PageNames.ServicesCategories, { isAdditionalService: true });
  }
}
