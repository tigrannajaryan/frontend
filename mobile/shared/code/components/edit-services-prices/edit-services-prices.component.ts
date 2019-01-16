import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ServiceFromAppointment } from '~/shared/api/stylist-app.models';
import { componentUnloaded } from '~/shared/component-unloaded';

@Component({
  selector: 'edit-services-prices',
  templateUrl: 'edit-services-prices.component.html'
})
export class EditServicesPricesComponent implements OnInit {

  @Input() services: ServiceFromAppointment[];
  @Output() servicesChange = new EventEmitter<ServiceFromAppointment[]>();

  form: FormGroup;

  focusedServiceUuid?: string = undefined;

  constructor(
    private formBuilder: FormBuilder
  ) {
  }

  ngOnInit(): void {
    this.createServicesPricesForm();
  }

  setFocusedService(service?: ServiceFromAppointment): void {
    this.focusedServiceUuid = service && service.service_uuid;
  }

  trackByServiceUuid(index: number, item: ServiceFromAppointment): string {
    return item.service_uuid;
  }

  private createServicesPricesForm(): void {
    // ControlsConfig is a collection of child controls. The key for each child is the name
    // under which it is registered. It is supplied to FormBuilder.group(…) call.
    // https://github.com/angular/angular/blob/7.1.4/packages/forms/src/form_builder.ts#L32-L33
    const controlsConfig: { [key: string]: any; } = {};

    for (const service of this.services) {
      controlsConfig[service.service_uuid] = ['', [
        Validators.required,
        Validators.pattern(/\d+/)
      ]];
    }

    this.form = this.formBuilder.group(controlsConfig);

    this.form.valueChanges
      .takeUntil(componentUnloaded(this))
      .debounceTime(500)
      .subscribe(() => this.onServicesChange());
  }

  private onServicesChange(): void {
    const changedServices: ServiceFromAppointment[] =
      Object.keys(this.form.controls)
        .filter(serviceUuid => this.form.controls[serviceUuid].valid)
        .map(serviceUuid => ({
          ...this.services.find(service => service.service_uuid === serviceUuid),
          // Keep client price, change regular price to what user typed
          regular_price: parseFloat(this.form.controls[serviceUuid].value)
        }));
    this.servicesChange.emit(changedServices);
  }
}
