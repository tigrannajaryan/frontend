import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import {
  ProfileState,
  RequestGetProfileAction,
  RequestUpdateProfileAction,
  selectIsLoading,
  selectProfile
} from '~/core/reducers/profile.reducer';
import { ISubscription } from 'rxjs/Subscription';
import { ProfileModel } from '~/core/api/profile.models';
import Countries from 'country-data/data/countries.json';
import { DEFAULT_COUNTRY_CODE, getUnifiedPhoneValue } from '~/core/directives/phone-input.directive';
import { phoneValidator } from '~/core/validators/phone.validator';
import { getCountryCallingCode, parseNumber } from 'libphonenumber-js';

/**
 * Generated class for the ProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile-page.component.html'
})
export class ProfilePageComponent {

  protected form: FormGroup;
  protected subscriptions: ISubscription[];

  isLoading = false;
  countries;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public formBuilder: FormBuilder,
              protected store: Store<ProfileState>) {
    // Init subscriptions
    this.subscriptions = [];
    // Form initialization.
    this.form = this.formBuilder.group({
      first_name: ['', [
        Validators.maxLength(25),
        Validators.minLength(2),
        Validators.required
      ]],
      last_name: ['', [
        Validators.maxLength(25),
        Validators.minLength(2),
        Validators.required
      ]],
      countryCode: [DEFAULT_COUNTRY_CODE,
        [Validators.required]
      ],
      phone: ['', [
        Validators.maxLength(15),
        Validators.minLength(5),
        Validators.required
      ]],
      zip_code: ['', [
        Validators.maxLength(15),
        Validators.minLength(5),
        Validators.required
      ]],
      birthday: ['', [
        Validators.maxLength(15),
        Validators.minLength(5),
        Validators.required
      ]]
    });
  }

  /*Ionic Lifecycle Evts */
  ionViewDidLoad(): void {
    this.countries = Countries.filter(country => country.countryCallingCodes.length > 0);
  }

  ionViewWillEnter(): void {
    this.store.dispatch(new RequestGetProfileAction());
    this.subscriptions.push(this.store.select(selectIsLoading)
      .subscribe(isLoading => {
        this.isLoading = isLoading;
      }));
    this.subscriptions.push(this.store.select(selectProfile)
      .subscribe((profile: ProfileModel) => {
        const phoneCountry = parseNumber(profile.phone);
        const formValue = {
          ...profile
        } as any;
        if (phoneCountry.country && phoneCountry.phone) {
          formValue.countryCode = phoneCountry.country;
          formValue.phone = phoneCountry.phone;
        }
        this.form.patchValue(
          formValue,
          {
            emitEvent: true
          }
        );
      }));
  }

  ionViewDidLeave(): void {
    for (const sub of this.subscriptions) {
      sub.unsubscribe();
    }
  }

  countrySelected(): void {
    this.form.get('phone').setValidators([Validators.required, phoneValidator(this.form.get('countryCode').value)]);
  }

  getPhoneCode(): string {
    const countryCode = this.form.get('countryCode').value;
    return `${countryCode} +${getCountryCallingCode(countryCode)}`;
  }

  submit(): void {
    const profileModel = {
      ...this.form.value,
      phone: getUnifiedPhoneValue(
        this.form.get('phone').value, this.form.get('countryCode').value
      )
    };
    // See if there is better way to do this.
    delete profileModel.countryCode;
    this.store.dispatch(new RequestUpdateProfileAction(profileModel));
  }

}
