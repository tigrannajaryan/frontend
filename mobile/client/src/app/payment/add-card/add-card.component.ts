import { Component, NgZone, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Keyboard, NavController } from 'ionic-angular';
import * as moment from 'moment';

import { componentIsActive } from '~/shared/utils/component-is-active';
import { reportToSentry } from '~/shared/sentry';
import { invalidFor } from '~/shared/validators/invalid-for.validator';

import { PaymentsApi } from '~/core/api/payments.api';
import { ProfileDataStore } from '~/profile/profile.data';

import { StripeError, StripeResponse } from '~/payment/stripe.models';
import { StripeService } from '~/payment/stripe.service.ts';

@Component({
  selector: 'add-card',
  templateUrl: 'add-card.component.html'
})
export class AddCardComponent {
  static CARD_NUMBER_COMMON_DIGITS_COUNT = 16;
  static CARD_EXP_DIGITS_COUNT = 4;

  form: FormGroup;
  isLoading = false;

  @ViewChild('cardExpInput') cardExpInput;
  @ViewChild('cardCvvInput') cardCvvInput;

  /**
   * This field can contain Stripe’s non-field API Error
   * (e.g. card declined or expired, processing error)
   */
  error: string;

  constructor(
    private api: PaymentsApi,
    private formBuilder: FormBuilder,
    private keyboard: Keyboard,
    private navCtrl: NavController,
    private profileData: ProfileDataStore,
    protected stripe: StripeService,
    private zone: NgZone
  ) {
  }

  async ionViewWillLoad(): Promise<void> {
    // Show keyboard nav btns
    this.keyboard.hideFormAccessoryBar(false);

    this.form = this.formBuilder.group({
      cardNumber: ['', [Validators.required]],
      cardExp: ['', [Validators.required]],
      cardCvv: ['', [Validators.required]]
    });

    const { response } = await this.profileData.get();
    if (response) {
      if (!response.stripe_public_key) {
        throw new Error('The stripe_public_key is not received from the profile');
      }
      this.stripe.setPublishableKey(response.stripe_public_key);
    } else {
      // An error received from the profile, we can only react with some general error
      this.showError('Payment service is not available.');
    }

    // Focus next field when a valid card input typed
    this.form.controls.cardNumber.valueChanges
      .takeWhile(componentIsActive(this))
      .subscribe(value => {
        const cardNumber = value.replace(/[^\d]+/g, '');
        if (
          cardNumber.length >= AddCardComponent.CARD_NUMBER_COMMON_DIGITS_COUNT &&
          this.stripe.validateCardNumber(cardNumber)
        ) {
          this.cardExpInput.setFocus();
        }
      });

    this.form.controls.cardExp.valueChanges
      .takeWhile(componentIsActive(this))
      .subscribe(value => {
        const mmyy = value.replace(/[^\d]+/g, '');
        if (mmyy.length === AddCardComponent.CARD_EXP_DIGITS_COUNT) {
          this.cardCvvInput.setFocus();
        }
      });
  }

  async onSaveClick(): Promise<void> {
    this.error = undefined;
    this.isLoading = true;

    const { cardNumber, cardExp, cardCvv: cvc } = this.form.value;
    const [ expMonth, yearEnd ] = cardExp.split('/');
    const expYear = String(moment().get('year')).replace(/\d{2}$/, yearEnd);

    const card = {
      number: cardNumber.replace(/[^\d]/g, ''),
      exp_month: expMonth, exp_year: expYear, cvc
    };

    let stripeResponse: StripeResponse;

    try {
      stripeResponse = (await this.stripe.createToken(card)) as StripeResponse;
    } catch (error) {
      this.isLoading = false;
      this.handleStripeError(error);
      return;
    }

    const { response, error } = await this.api.addPaymentMethod({
      stripe_token: stripeResponse.id
    }, {
      // For consistency show billing errors in the same place where Stripe errors are shown.
      hideAllErrors: true
    }).toPromise();

    if (response) {
      this.isLoading = false;
      this.navCtrl.pop();

    } else if (error) {
      this.showError(error.getMessage());
    }

    this.isLoading = false;
  }

  /**
   * Show nice error message in an error container.
   */
  private handleStripeError(response: StripeResponse): void {
    const error: StripeError = response && response.error;

    switch (error && error.type) {
      case 'card_error':
      case 'validation_error':
        this.handleCardError(error);
        break;

      default:
        reportToSentry(error);
        this.showError(error && error.message);
        // TODO: suggest to re-try or skip (?) adding card and continue with booking
        break;
    }
  }

  private handleCardError(error: StripeError): void {
    if (!error.message) {
      reportToSentry(error);
      this.showError();
      return;
    }

    switch (error.code) {
      case 'incorrect_number':
      case 'invalid_number':
        this.setStripeFieldError('cardNumber', error.message);
        break;

      case 'invalid_expiry_month':
      case 'invalid_expiry_year':
        this.setStripeFieldError('cardExp', error.message);
        break;

      case 'incorrect_cvc':
        this.setStripeFieldError('cardCvv', error.message);
        break;

      default:
        this.showError(error.message);
        break;
    }
  }

  private setStripeFieldError(controlName: 'cardNumber' | 'cardExp' | 'cardCvv', errorMessage: string): void {
    this.zone.run(() => {
      this.form.controls[controlName].setValidators([
        this.form.controls[controlName].validator,
        invalidFor(
          this.form.controls[controlName].value,
          { stripe: errorMessage }
        )
      ]);
      this.form.controls[controlName].updateValueAndValidity();
    });
  }

  private showError(errorText = 'Unable to save your credit card.'): void {
    this.error = errorText;
  }
}
