import { Component, Input } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';

import { PageNames } from '~/core/page-names';
import { ServiceModel } from '~/core/api/services.models';
import { BookingData } from '~/core/api/booking.data';

@Component({
  selector: 'book-services-header',
  templateUrl: 'services-header.html'
})
export class BookServicesHeaderComponent {
  @Input() readonly: boolean;

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
