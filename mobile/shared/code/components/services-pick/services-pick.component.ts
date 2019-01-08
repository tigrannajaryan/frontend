import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ServiceCategory, ServiceFromAppointment } from '~/shared/api/stylist-app.models';

@Component({
  selector: 'services-pick',
  templateUrl: 'services-pick.component.html'
})
export class ServicesPickComponent {
  @Output() serviceAdd = new EventEmitter();

  @Input() set services(serviceCategory: ServiceCategory[]) {
    this.serviceCategory = serviceCategory;
    this.onServiceChange();
  }
  serviceCategory: ServiceCategory[];

  onServiceChange(service?: ServiceFromAppointment): void {
    if (service) {
      service.isChecked = !service.isChecked;
    }

    const checkedServices: ServiceFromAppointment[] = [];
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
