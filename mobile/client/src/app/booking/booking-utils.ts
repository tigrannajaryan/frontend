import { AlertController, Events } from 'ionic-angular';

import { AppModule } from '~/app.module';
import { BookingData } from '~/core/api/booking.data';
import { PreferredStylistsData } from '~/core/api/preferred-stylists.data';
import { AppointmentModel } from '~/core/api/appointments.models';
import { PreferredStylistModel } from '~/shared/api/stylists.models';
import { ServicesService } from '~/core/api/services.service';
import { ClientEventTypes } from '~/core/client-event-types';

//
// Possible cases of booking and re-booking processes
//
// Case:  common.
// Enter: when clicking on book btn.
// Pages: Select Stylist –> Select Service (2 screens) –> Select Date –> Select Time –> Appointment Preview
//
// Case:  common from stylist page.
// Enter: when clicking on the stylist pic on the stylist page we already know the stylist.
// Pages: Select Service (2 screens) –> Select Date –> Select Time –> Appointment Preview
//
// Case:  no preferred.
// Enter: in a very rare situation when a user closes app after login and re-opens again.
//        A user is required to choose at least one stylist before continue.
// Pages: Select Stylist –> Home:Stylists –> Stylists Search (”Choose your stylists” popup)
//
// Case:  no free timeslots.
// Enter: when no timeslots available on Select Date screen. Can happen when a stylist
//        set empty working days, e.g. stylist on vacation.
// Pages: Select Stylist –> Select Service (2) –> Select Date (”No time slots” popup) –> Select Stylist (a different one)
//
// Case:  re-booking not preferred and all the services exist (common re-booking).
// Enter: when clicking on re-book btn.
// Pages: ”Add to saved stylists” popup –> Select Date –> Select Time –> Appointment Preview
//
// Case:  re-booking not preferred and not all the services found.
// Enter: when clicking on re-book btn and when a stylist removed or changed one of the services.
// Pages: Select Service (2) –> Select Date –> Select Time –> Appointment Preview
//

/**
 * Get the preferred stylist of the user. Throws Error if there are no
 * preferred stylists.
 */
export async function getPreferredStylist(stylistUuid: string): Promise<PreferredStylistModel> {
  const preferredStylistsData = AppModule.injector.get(PreferredStylistsData);

  const preferredStylists = await preferredStylistsData.get();
  if (!preferredStylists || preferredStylists.length === 0 || !preferredStylists[0]) {
    throw Error('No preferred stylists. Please find a stylist.');
  }

  const preferredStylist = preferredStylists.find(({ uuid }) => uuid === stylistUuid);
  if (!preferredStylist) {
    throw Error('Stylist is not a preferred one.');
  }

  return preferredStylist;
}

/**
 * Prepare data to start booking process. Required at least one preferred stylist
 * to be defined in PreferredStylistsData otherwise will throw an Error.
 */
export async function startBooking(stylistUuid: string): Promise<PreferredStylistModel> {
  const bookingData = AppModule.injector.get(BookingData);

  const stylist = await getPreferredStylist(stylistUuid);
  bookingData.start(stylist);

  return stylist;
}

/**
 * Begins rebooking process. Will call prepareBooking to prepare booking process data
 * set for new booking the same services as the previous appointment and
 * will proceed to appropriate first screen of booking process. The first screen is
 * PageNames.SelectDate if services are known, otherwise the first screen is
 * PageNames.ServicesCategories (which can happen if services no longer exist)
 * @param appointment the original appointment to use as a model for rebooking
 */
export async function startRebooking(appointment: AppointmentModel): Promise<void> {

  const events = AppModule.injector.get(Events);

  const preferredStylist = await getPreferredStylist(appointment.stylist_uuid);

  // Get current services of our preferred stylist
  const servicesApi = AppModule.injector.get(ServicesService);
  const { response } = await servicesApi.getStylistServices({ stylist_uuid: preferredStylist.uuid }).get();
  if (!response) {
    // Couldn't get the services. Error should be already reported, just return.
    return;
  }

  // Ensure all services of previous appointment still exist
  const foundAll = appointment.services.every(
    service => response.categories.some(c => {
      return c.services.some(s => {
        if (s.uuid === service.service_uuid) {
          // Service found, update price and name in case it was changes since last booking
          service.regular_price = s.base_price;
          service.service_name = s.name;
          return true;
        } else {
          return false;
        }
      });
    }));

  if (!foundAll) {
    // Some of the selected services are no longer found. Just start the booking process from fresh.
    events.publish(ClientEventTypes.startBooking, appointment.stylist_uuid);
  } else {
    // All services still exist. Start booking process.
    await startBooking(appointment.stylist_uuid);

    // Preselect services
    const bookingData = AppModule.injector.get(BookingData);
    bookingData.setSelectedServices(appointment.services.map(s => ({
      uuid: s.service_uuid,
      name: s.service_name,
      base_price: s.regular_price
    })));

    // Services are now selected, we can now start rebooking.
    events.publish(ClientEventTypes.startRebooking);
  }
}

/**
 * Ask for confirmation to make the stylist a preferred one.
 */
export function confirmMakeStylistPreferred(stylistFirstName: string, stylistUuid: string): Promise<boolean> {
  const alertCtrl = AppModule.injector.get(AlertController);
  const preferredStylistsData = AppModule.injector.get(PreferredStylistsData);

  return new Promise((resolve, reject) => {
    const alert = alertCtrl.create({
      title: 'Hold on a sec',
      message: `
      <b>${stylistFirstName}</b> is required to be listed as your saved stylist to proceed with booking.
      Would you like to add <b>${stylistFirstName}</b> to your saved list of stylists?
    `.trim(),
      buttons: [
        {
          text: 'No, cancel',
          role: 'cancel',
          handler: () => {
            resolve(false);
          }
        },
        {
          text: 'Yes, continue',
          handler: () => {
            preferredStylistsData.addStylist({ uuid: stylistUuid }).then(() => {
              resolve(true);
            });
          }
        }
      ]
    });
    alert.present();
  });
}

/**
 * When a stylist is not a preferred one of a client show a popup.
 * The Promise returned from the method indicates 2 situations:
 * - true means either stylist is a preferred one or confirmed to become,
 * - false means stylist is not a preferred one and not confirmed to become.
 */
export function confirmRebook(appointment: AppointmentModel): Promise<boolean> {
  const preferredStylistsData = AppModule.injector.get(PreferredStylistsData);

  return new Promise(async (resolve, reject): Promise<void> => {
    const preferedStylists = await preferredStylistsData.get();
    if (preferedStylists.some(stylist => stylist.uuid === appointment.stylist_uuid)) {
      // Allready preferred one, skip showing the popup:
      return resolve(true);
    }
    // Not preferred, show warning popup:
    return resolve(confirmMakeStylistPreferred(appointment.stylist_first_name, appointment.stylist_uuid));
  });
}
