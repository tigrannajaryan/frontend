import { App } from 'ionic-angular';
import {
  ProfileIncompleteField,
  ProfileIncompleteObject,
  StylistProfile,
  StylistProfileCompleteness
} from '~/shared/api/stylist-app.models';
import { PageNames } from '~/core/page-names';
import { RegistrationForm, RegistrationFormControl } from '~/onboarding/registration.form';
import { AppModule } from '~/app.module';
import { FieldEditComponentParams } from '~/onboarding/field-edit/field-edit.component';

export function calcProfileCompleteness(fields: StylistProfile): StylistProfileCompleteness {
  const {
    first_name,
    last_name,
    salon_name,
    salon_address,
    profile_photo_url,
    email,
    website_url,
    instagram_integrated,
    profile_status
  } = fields;

  // tslint:disable-next-line:variable-name
  const has_deal_of_week = !profile_status.must_select_deal_of_week;

  // set all required fields
  const profileCompleteness = [
    first_name,
    last_name,
    salon_name,
    salon_address,
    profile_photo_url,
    email,
    website_url,
    instagram_integrated,
    has_deal_of_week,
    profile_status.has_weekday_discounts_set,
    profile_status.has_invited_clients,
    profile_status.has_services_set,
    profile_status.has_business_hours_set,
    profile_status.can_checkout_with_made,
    profile_status.google_calendar_integrated
  ];

  const app = AppModule.injector.get(App);
  const registrationForm = AppModule.injector.get(RegistrationForm);

  const profileIncomplete: ProfileIncompleteObject[] = [
    {
      name: 'Set First Name',
      type: ProfileIncompleteField.first_name,
      isComplete: false,
      onClick: () => {
        // this is required field on registration
      }
    },
    {
      name: 'Set Last Name',
      type: ProfileIncompleteField.last_name,
      isComplete: false,
      onClick: () => {
        // this is required field on registration
      }
    },
    {
      name: 'Set Salon Name',
      type: ProfileIncompleteField.salon_name,
      isComplete: false,
      onClick: () => {
        // this is required field on registration
      }
    },
    {
      name: 'Set Salon Address',
      type: ProfileIncompleteField.salon_address,
      isComplete: false,
      onClick: () => {
        // this is required field on registration
      }
    },
    {
      name: 'Add Photo',
      type: ProfileIncompleteField.profile_photo_url,
      isComplete: false,
      onClick: () => {
        registrationForm.processPhoto();
      }
    },
    {
      name: 'Add Email',
      type: ProfileIncompleteField.email,
      isComplete: false,
      onClick: () => {
        const params: FieldEditComponentParams = {
          isRootPage: true,
          control: RegistrationFormControl.Email
        };
        app.getRootNav().push(PageNames.FieldEdit, { params });
      }
    },
    {
      name: 'Add Website',
      type: ProfileIncompleteField.website_url,
      isComplete: false,
      onClick: () => {
        const params: FieldEditComponentParams = {
          isRootPage: true,
          control: RegistrationFormControl.Website
        };
        app.getRootNav().push(PageNames.FieldEdit, { params });
      }
    },
    {
      name: 'Add Instagram',
      type: ProfileIncompleteField.instagram_integrated,
      isComplete: false,
      onClick: () => {
        app.getRootNav().push(PageNames.ConnectInstagram, { params: { isRootPage: true }});
      }
    },
    {
      name: 'Set Deal of the Week',
      type: ProfileIncompleteField.has_deal_of_week,
      isComplete: false,
      onClick: () => {
        app.getRootNav().push(PageNames.DiscountsDeal);
      }
    },
    {
      name: 'Set Discounts',
      type: ProfileIncompleteField.has_weekday_discounts_set,
      isComplete: false,
      onClick: () => {
        app.getRootNav().push(PageNames.DiscountsDaily);
      }
    },
    {
      name: 'Invite Clients',
      type: ProfileIncompleteField.has_invited_clients,
      isComplete: false,
      onClick: () => {
        app.getRootNav().push(PageNames.Invitations, { isRootPage: true });
      }
    },
    {
      name: 'Set Services',
      type: ProfileIncompleteField.has_services_set,
      isComplete: false,
      onClick: () => {
        app.getRootNav().push(PageNames.Services);
      }
    },
    {
      name: 'Set Hours',
      type: ProfileIncompleteField.has_business_hours_set,
      isComplete: false,
      onClick: () => {
        app.getRootNav().push(PageNames.WorkHours, { isRootPage: false });
      }
    },
    {
      name: 'Set Your Payment Method',
      type: ProfileIncompleteField.can_checkout_with_made,
      isComplete: false,
      onClick: () => {
        app.getRootNav().push(PageNames.Settings);
      }
    },
    {
      name: 'Set Your Payment Method',
      type: ProfileIncompleteField.google_calendar_integrated,
      isComplete: false,
      onClick: () => {
        app.getRootNav().push(PageNames.Settings);
      }
    }
  ];

  for (const key of profileCompleteness.keys()) {
    profileIncomplete[key].isComplete = !!profileCompleteness[key];
  }

  const complete = Number(profileCompleteness.reduce((previousValue: number, currentValue) => {
    return !!currentValue ? ++previousValue : previousValue;
  }, 0));
  const completenessPercent = calcPercentageDifference(profileCompleteness.length, complete);

  return {
    isProfileComplete: profileCompleteness.every(item => !!item),
    completenessPercent: +completenessPercent.toFixed(),
    profileIncomplete
  };
}

function calcPercentageDifference(oldNumber: number, newNumber: number): number {
  const decreaseValue = oldNumber - newNumber;

  return -((decreaseValue / oldNumber) * 100 - 100);
}
