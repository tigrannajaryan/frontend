import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Events, Nav } from 'ionic-angular';

import { PushNotificationEventDetails } from '~/shared/events/shared-event-types';
import {
  NewAppointmentAdditionalData,
  PushNotificationCode,
  TomorrowAppointmentsAdditionalData
} from '~/shared/push/push-notification';
import { PushNotificationHandlerParams, PushNotificationToastService } from '~/shared/push/push-notification-toast';

import {
  FocusAppointmentEventParams,
  SetStylistProfileTabEventParams,
  StylistEventTypes
} from '~/core/stylist-event-types';
import { PageNames } from '~/core/page-names';

import { AppointmentCheckoutParams } from '~/appointment/appointment-checkout/appointment-checkout.component';
import { ProfileTabs } from '~/profile/profile.component';
import { WorkHoursComponentParams } from '~/workhours/workhours.component';

@Component({
  selector: 'push-notifications-tracker',
  // We only show toasts in the component, no template needed:
  template: ''
})
export class StylistPushNotificationsTrackerComponent implements OnInit, OnDestroy {
  static toastCssClass = 'PushNotificationToast';
  static toastVisibleDurationMs = 5000;

  // We have to pass Nav as a param because of using this component inside app.component.
  // Nav is needed for navigation side-effects on push notification received.
  @Input() nav: Nav;

  constructor(
    private events: Events,
    private pushToast: PushNotificationToastService
  ) {
  }

  ngOnInit(): void {
    this.pushToast.subscribe(this.handlePushNotification);
  }

  ngOnDestroy(): void {
    this.pushToast.unsubscribe(this.handlePushNotification);
  }

  private handlePushNotification = (details: PushNotificationEventDetails): PushNotificationHandlerParams | void => {
    // Put the differencies between notifications in the switch/case:
    switch (details.code) {

      case PushNotificationCode.new_appointment: {
        const { appointment_datetime_start_at, appointment_uuid } = details.data as NewAppointmentAdditionalData;
        return {
          buttonText: 'Open',
          onClick: async (): Promise<void> => {
            await this.nav.setRoot(PageNames.HomeSlots);
            this.events.publish(
              StylistEventTypes.focusAppointment,
              { appointment_datetime_start_at, appointment_uuid } as FocusAppointmentEventParams
            );
            const checkoutParams: AppointmentCheckoutParams = {
              appointmentUuid: appointment_uuid,
              isReadonly: true
            };
            await this.nav.push(PageNames.AppointmentCheckout, { data: checkoutParams });
          }
        };
      }

      case PushNotificationCode.tomorrow_appointments: {
        const { appointment_datetime_start_at } = details.data as TomorrowAppointmentsAdditionalData;
        return {
          buttonText: 'Open',
          onClick: async (): Promise<void> => {
            await this.nav.setRoot(PageNames.HomeSlots);
            this.events.publish(
              StylistEventTypes.focusAppointment,
              { appointment_datetime_start_at } as FocusAppointmentEventParams
            );
          }
        };
      }

      case PushNotificationCode.remind_define_services: {
        return {
          buttonText: 'Open',
          onClick: async (): Promise<void> => {
            await this.nav.setRoot(PageNames.Services);
          }
        };
      }

      case PushNotificationCode.remind_add_photo: {
        return {
          buttonText: 'Open',
          onClick: async (): Promise<void> => {
            await this.nav.setRoot(PageNames.Profile);
            this.events.publish(
              StylistEventTypes.setStylistProfileTab,
              { profileTab: ProfileTabs.edit } as SetStylistProfileTabEventParams
            );
          }
        };
      }

      case PushNotificationCode.remind_define_hours: {
        return {
          buttonText: 'Open',
          onClick: async (): Promise<void> => {
            const params: WorkHoursComponentParams = { isRootPage: true };
            await this.nav.setRoot(PageNames.WorkHours, { params });
          }
        };
      }

      default:
        return;
    }
  };
}
