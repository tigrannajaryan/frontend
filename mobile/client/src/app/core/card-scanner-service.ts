import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';

export interface CardScannerResponse {
  cardNumber: string;
  cardType: string;
  redactedCardNumber: string;
}

// For more config options see https://www.npmjs.com/package/cordova-plugin-card-io#supported-configurations
export interface CardIOConfig {
  requireExpiry: boolean;
  requireCVV: boolean;
  requirePostalCode: boolean;
  suppressManual: boolean;
  hideCardIOLogo: boolean;
  scanExpiry: boolean;
  suppressConfirmation: boolean;
}

export type CardIOCheck = (canScan: boolean) => void;
export type CardIOComplete = (response: CardScannerResponse) => void;
export type CardIOCancel = () => void;

export interface CardIOInterface {
  canScan(onCardIOCheck: CardIOCheck): void;
  scan(
    config: CardIOConfig,
    onCardIOComplete: CardIOComplete,
    onCardIOCancel: CardIOCancel
  ): void;
}

declare const CardIO: CardIOInterface;

@Injectable()
export class CardScannerService {

  constructor(
    private platform: Platform
  ) {
  }

  scan(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      if (!this.platform.is('cordova')) {
        reject(new Error('Card scanner works in Cordova environment only'));
      } else {
        CardIO.canScan(canScan => {
          if (!canScan) {
            reject(new Error('Card scanner cannot scan'));
          } else {
            CardIO.scan({
              requireExpiry: false,
              requireCVV: false,
              requirePostalCode: false,
              suppressManual: true,
              hideCardIOLogo: true,
              scanExpiry: false, // true doesn’t work in reality
              suppressConfirmation: true
            },
            (response: CardScannerResponse) => {
              resolve(response.cardNumber);
            },
            () => {
              resolve();
            }
          );
          }
        });
      }
    });
  }
}
