import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ServiceModel } from '~/core/api/services.models';

@Component({
  selector: 'book-services-header',
  templateUrl: 'services-header.html'
})
export class BookServicesHeaderComponent {

  @Input()
  services: ServiceModel[];

  @Output()
  deleteClick = new EventEmitter<ServiceModel>();

  @Output()
  addClick = new EventEmitter<void>();
}
