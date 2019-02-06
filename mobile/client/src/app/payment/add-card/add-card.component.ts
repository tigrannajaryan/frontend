import { Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController } from 'ionic-angular';
import * as moment from 'moment';

import { reportToSentry } from '~/shared/sentry';
import { invalidFor } from '~/shared/validators/invalid-for.validator';

import { PaymentsApi } from '~/core/api/payments.api';

import { StripeError, StripeTokenID } from '~/payment/stripe.models';
import { StripeService } from '~/payment/stripe.service.ts';

@Component({
  selector: 'add-card',
  templateUrl: 'add-card.component.html'
})
export class AddCardComponent implements OnInit {
  static SHOW_GENERAL_ERROR_MS = 7000;

  form: FormGroup;

  /**
   * This field can contain Stripe’s non-field API Error
   * (e.g. card declined or expired, processing error)
   */
  stripeError: string;

  /**
   * Next fields are needed to handle Stripe’s non-card-relative errors
   * (e.g. Stripe is down, authentication in Stripe is failed)
   */
  hasGeneralError = false;
  generalErrorText = 'Payment service is not available. Try again later.';
  private hideErrorTimeout: any; // Timer

  constructor(
    private api: PaymentsApi,
    private formBuilder: FormBuilder,
    private navCtrl: NavController,
    private stripe: StripeService,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      cardNumber: ['', [Validators.required]],
      cardExp: ['', [Validators.required]],
      cardCvv: ['', [Validators.required]]
    });
  }

  async onSaveClick(): Promise<void> {
    this.stripeError = undefined;

    const { cardNumber, cardExp, cardCvv: cvc } = this.form.value;
    const [ expMonth, yearEnd ] = cardExp.split('/');
    const expYear = String(moment().get('year')).replace(/\d{2}$/, yearEnd);

    const card = {
      number: cardNumber.replace(/[^\d]/g, ''),
      exp_month: expMonth, exp_year: expYear, cvc
    };

    await this.stripe.setPublishableKey('pk_test_DopSOGBZm9USK4nl8L0HOXoH');

    try {
      const token = await this.stripe.createToken(card);
      const { response } = await this.api.addPaymentMethod({ stripe_token: token as StripeTokenID }).toPromise();

      if (response) {
        this.navCtrl.pop();
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Show nice error message in an error container.
   */
  private handleError(error: StripeError): void {
    switch (error && error.type) {
      case 'card_error':
      case 'validation_error':
        this.handleCardError(error);
        break;

      default:
        reportToSentry(error);
        this.toggleGeneralError(true);
        // TODO: suggest to re-try or skip adding card and continue with booking (?)
        break;
    }
  }

  private handleCardError(error: StripeError): void {
    if (!error.message) {
      reportToSentry(error);
      this.toggleGeneralError(true);
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
        this.stripeError = error.message;
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

  private toggleGeneralError(show: boolean): void {
    if (this.hideErrorTimeout) {
      clearTimeout(this.hideErrorTimeout);
    }

    if (show) {
      this.hasGeneralError = true;

      this.hideErrorTimeout = setTimeout(() => {
        this.toggleGeneralError(false);
      }, AddCardComponent.SHOW_GENERAL_ERROR_MS);
    } else {
      this.hasGeneralError = false;
    }
  }
}
