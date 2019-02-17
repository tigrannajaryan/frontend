import { async, TestBed } from '@angular/core/testing';
import { IonicModule } from 'ionic-angular';

import { CardScannerService } from './card-scanner-service';

let instance: CardScannerService;

const testCardNumber = '4242424242424242';

// Mock CardIO
(window as any).CardIO = {
  canScan(onCardIOCheck): void {
    onCardIOCheck(/* canScan */ true);
  },
  scan: (config, resolve, reject) => {
    resolve({
      cardNumber: testCardNumber
    });
  }
};

describe('InstagramOAuthService', () => {
  beforeEach(async(() =>
    TestBed
      .configureTestingModule({
        providers: [
          CardScannerService
        ],
        imports: [
          // Load all Ionic’s deps:
          // tslint:disable-next-line:no-invalid-this
          IonicModule.forRoot(this)
        ]
      })
      .compileComponents()
      .then(() => {
        instance = TestBed.get(CardScannerService);
      })
  ));

  it('should create the service', () => {
    expect(instance).toBeTruthy();
  });

  it('should correctly scan a card', async done => {
    const cardNumber = await instance.scan();

    expect(cardNumber)
      .toBe(testCardNumber);

    done();
  });
});
