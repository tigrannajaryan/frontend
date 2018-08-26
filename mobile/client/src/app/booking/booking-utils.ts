import { Events } from 'ionic-angular';

import { AppModule } from '~/app.module';
import { BookingData } from '~/core/api/booking.data';
import { PreferredStylistsData } from '~/core/api/preferred-stylists.data';
import { AppointmentModel } from '~/core/api/appointments.models';
import { PreferredStylistModel } from '~/core/api/stylists.models';
import { ServicesService } from '~/core/api/services-service';
import { EventTypes } from '~/core/event-types';

/**
 * Get the preferred stylist of the user. Throws Error if there are no
 * preferred stylists.
 */
export async function getPreferredStylist(): Promise<PreferredStylistModel> {
  const preferredStylistsData = AppModule.injector.get(PreferredStylistsData);

  const preferredStylists = await preferredStylistsData.get();
  if (!preferredStylists || preferredStylists.length === 0 || !preferredStylists[0]) {
    throw Error('No preferred stylists. Please find a stylist.');
  }

  // Use the first preferred stylist (if we have any)
  return preferredStylists[0];
}

/**
 * Prepare data to start booking process. Required at least one preferred stylist
 * to be defined in PreferredStylistsData otherwise will throw an Error.
 */
export async function startBooking(): Promise<PreferredStylistModel> {
  const preferredStylist = await getPreferredStylist();

  const bookingData = AppModule.injector.get(BookingData);
  bookingData.start(preferredStylist);

  return preferredStylist;
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

  const preferredStylist = await getPreferredStylist();

  // Get current services of our preferred stylist
  const servicesApi = AppModule.injector.get(ServicesService);
  const currentServices = (await servicesApi.getStylistServices({ stylist_uuid: preferredStylist.uuid }).toPromise()).response;
  if (!currentServices) {
    // Couldn't get the services. Error should be already reported, just return.
    return;
  }

  // Ensure all services of previous appointment still exist
  const foundAll = appointment.services.every(
    service => currentServices.categories.some(c => {
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
    events.publish(EventTypes.startBooking);
  } else {
    // All services still exist. Start booking process.
    await startBooking();

    // Preselect services
    const bookingData = AppModule.injector.get(BookingData);
    bookingData.setSelectedServices(appointment.services.map(s => ({
      uuid: s.service_uuid,
      name: s.service_name,
      base_price: s.regular_price
    })));

    // Services are now selected, we can now start rebooking.
    events.publish(EventTypes.startRebooking);
  }
}
