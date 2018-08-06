import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AlertController, ModalController, NavController, NavParams } from 'ionic-angular';
import { StylistServiceProvider } from '~/core/api/stylist/stylist.api';
import { ServiceCategory } from '~/core/api/stylist/stylist.models';
import { AppointmentService } from '~/core/api/home/home.models';

@Component({
  selector: 'services-pick',
  templateUrl: 'services-pick.component.html'
})
export class ServicesPickComponent {
  @Output() serviceAdd = new EventEmitter();
  @Input()
  set services(serviceCategory: ServiceCategory[]) {
    this.serviceCategory = serviceCategory;
    this.onServiceChange();
  }
  protected serviceCategory: ServiceCategory[];

  constructor(
    protected navCtrl: NavController,
    protected navParams: NavParams,
    protected modalCtrl: ModalController,
    protected alertCtrl: AlertController,
    protected stylistService: StylistServiceProvider
  ) {
  }

  protected onServiceChange(service?: AppointmentService): void {
    if (service) {
      service.isChecked = !service.isChecked;
    }

    const checkedServices: AppointmentService[] = [];
    for (const categoryItem of this.serviceCategory) {
      for (const servicesItems of categoryItem.services) {
        if (servicesItems.isChecked) {
          checkedServices.push({
            service_uuid: servicesItems.uuid,
            service_name: servicesItems.name,
            regular_price: servicesItems.base_price,
            is_original: true,
            client_price: 0
          });
        }
      }
    }
    this.serviceAdd.emit(checkedServices);
  }
}
