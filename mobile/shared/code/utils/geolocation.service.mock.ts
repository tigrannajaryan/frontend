declare const jasmine: any;

export const defaultLocation = {
  // Statue of Liberty in NY
  latitude: 40.6892534,
  longitude: -74.0466891
};

export class GeolocationServiceMock {
  getUserCoordinates = jasmine.createSpy('getUserCoordinates').and.returnValue(
    Promise.resolve(defaultLocation)
  );
}
