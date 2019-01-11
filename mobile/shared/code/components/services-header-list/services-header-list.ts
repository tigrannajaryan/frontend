import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ServiceModel } from '~/shared/api/price.models';

export interface PricingHint {
  priority: number;
  hint: string;
}

/**
 * Generic component to show a list of services as tags in a header
 * which allows adding and removing service items.
 */
@Component({
  selector: 'services-header-list',
  templateUrl: 'services-header-list.html'
})
export class ServicesHeaderListComponent {
  // Set to true to disallow deleting or adding services.
  @Input() readonly: boolean;
  @Input() hints: PricingHint[];

  @Input()
  services: ServiceModel[];

  @Output() deleteService = new EventEmitter<ServiceModel>();
  @Output() addService = new EventEmitter<void>();

  onDelete(service: ServiceModel): void {
    this.deleteService.emit(service);
  }

  onAdd(): void {
    this.addService.emit();
  }
}
