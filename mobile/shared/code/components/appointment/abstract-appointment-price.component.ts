import { FormControl } from '@angular/forms';

import { AppointmentPreviewResponse, BaseAppointmentModel } from '~/shared/api/appointments.models';
import { CheckOutService, ServiceFromAppointment } from '~/shared/api/stylist-app.models';

export abstract class AbstractAppointmentPriceComponent {
  appointment: BaseAppointmentModel;
  preview: AppointmentPreviewResponse;

  changedServices: ServiceFromAppointment[] = [];
  priceChangeReason: FormControl = new FormControl('');

  isLoading = false;

  /**
   * Should re-create appointment preview.
   */
  abstract updatePreview(): Promise<void>;

  /**
   * Should be called when ”Update” is pressed.
   */
  abstract onSave(): Promise<void>;

  /**
   * Should be passed to EditServicesPricesComponent component.
   */
  onServicesChange(changedServices: ServiceFromAppointment[]): void {
    this.changedServices = changedServices;
    this.updatePreview();
  }

  /**
   * Returnes original services mixed with changed services.
   */
  protected getServicesWithPrices(): CheckOutService[] {
    return this.appointment.services.map(service => {
      const changedService = this.getChangedService(service);
      if (changedService) {
        return {
          service_uuid: changedService.service_uuid,
          // NOTE: the client_price must only be supplied if this price is actually edited
          client_price: changedService.client_price
        };
      }
      return {
        service_uuid: service.service_uuid
      };
    });
  }

  /**
   * Returnes changed service or undefined from ServiceFromAppointment.
   */
  protected getChangedService(service: ServiceFromAppointment): ServiceFromAppointment | undefined {
    return this.changedServices.find(changedService =>
      changedService.service_uuid === service.service_uuid
    );
  }
}
