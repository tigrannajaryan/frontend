import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Events, Nav } from 'ionic-angular';

import { PushNotificationEventDetails } from '~/shared/events/shared-event-types';
import { PushNotificationCode } from '~/shared/push/push-notification';
import { PushNotificationHandlerParams, PushNotificationToastService } from '~/shared/push/push-notification-toast';

import { FocusAppointmentEventParams, StylistEventTypes } from '~/core/stylist-event-types';
import { PageNames } from '~/core/page-names';

import { AppointmentCheckoutParams } from '~/appointment/appointment-checkout/appointment-checkout.component';

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

      case PushNotificationCode.new_appointment:
      case PushNotificationCode.tomorrow_appointments: {
        const { appointment_datetime_start_at, appointment_uuid } = details.data;
        return {
          buttonText: 'Open',
          onClick: async (): Promise<void> => {
            const activePage = this.nav.getActive();
            if (activePage.component !== PageNames.HomeSlots) {
              await this.nav.setRoot(PageNames.HomeSlots);
            }
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

      default:
        return;
    }
  };
}
