import { Injectable } from '@angular/core';
import { AlertController, Platform } from 'ionic-angular';
import { Diagnostic } from '@ionic-native/diagnostic';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';

export interface LatLng {
  latitude: number;
  longitude: number;
}

@Injectable()
export class GeolocationService {

  static getGeopositionInBrowser(): Promise<Geoposition> {
    return new Promise(resolve => {
      if (!('geolocation' in navigator)) {
        return resolve();
      }
      navigator.geolocation.getCurrentPosition(resolve, () => resolve(), {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      });
    });
  }

  constructor(
    private alertCtrl: AlertController,
    private diagnostic: Diagnostic,
    private geolocation: Geolocation,
    private platform: Platform
  ) {
  }

  /**
   * Requests permissions if needed and returns geoposition coordinates (latitude, longitude) if possible.
   */
  async getUserCoordinates(twoStepPriming = false): Promise<LatLng | undefined> {

    if (!this.platform.is('cordova')) {
      const geoposition = await GeolocationService.getGeopositionInBrowser();
      return geoposition && geoposition.coords;
    }

    if (!await this.diagnostic.isLocationEnabled()) {
      // There is nothing we can do if the Location Mode / Service is switched off.
      return;
    }

    if (await this.diagnostic.getLocationAuthorizationStatus() === 'denied') {
      // User refused to grant permissions. Nothing we can do now.
      // Later we may show a link to change it in OS settings.
      return;
    }

    if (twoStepPriming) {
      let permissionsGranted = await this.isPermissionGranted();

      if (!permissionsGranted) {
        permissionsGranted = await this.requestPermissions();
      }

      if (!permissionsGranted) { // still no
        return;
      }
    }

    const geoposition = await this.getUserGeoposition();
    return geoposition && geoposition.coords;
  }

  /**
   * Checks if user gave permissions to track his coordinates.
   */
  private isPermissionGranted(): Promise<boolean> {
    return this.diagnostic.isLocationAvailable();
  }

  /**
   * - Shows an alert to ask for providing geolocation permissions.
   * - After clicking ”Yes” shows system window to request the permissions.
   * - If user clicks ”No” closes alert and leaves a possibility for us to re-request permissions.
   *
   * Note: the same method `getCurrentPosition()` is used to either request permissions or get location.
   *
   * This is a Two-Step Priming approach,
   * see https://www.plotprojects.com/blog/how-to-ask-for-location-permissions-in-ios11-recommended-approaches-10-examples/
   */
  private requestPermissions(): Promise<boolean> {
    return new Promise(resolve => {
      const alert = this.alertCtrl.create({
        title: 'Can we use your location?',
        message: 'We would like to use your coordinates to show stylists nearby.',
        buttons: [
          {
            text: 'Not now',
            role: 'cancel',
            handler: () => {
              // TODO: ask e.g. once a day if refused
              resolve(false);
            }
          },
          {
            text: 'Yes',
            handler: () => {
              this.getUserGeoposition().then(coords => resolve(Boolean(coords)));
            }
          }
        ]
      });
      alert.present();
    });
  }

  private async getUserGeoposition(): Promise<Geoposition> {
    try {
      return await this.geolocation.getCurrentPosition();
    } catch (error) {
      // Unable to get user location. User might refuse to allow getting it.
    }
  }
}
