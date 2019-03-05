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

const noop = () => {
  // we use an empty function ”noop” to not overcomplicate the code with checks for `onClick` existence
  // onClick is required method for each ProfileIncompleteObject
};

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
      onClick: noop
    },
    {
      name: 'Set Last Name',
      type: ProfileIncompleteField.last_name,
      isComplete: false,
      onClick: noop
    },
    {
      name: 'Set Salon Name',
      type: ProfileIncompleteField.salon_name,
      isComplete: false,
      onClick: noop
    },
    {
      name: 'Set Salon Address',
      type: ProfileIncompleteField.salon_address,
      isComplete: false,
      onClick: noop
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
      name: 'Set Discounts',
      type: ProfileIncompleteField.has_weekday_discounts_set,
      isComplete: false,
      onClick: () => {
        app.getRootNav().push(PageNames.Discounts, { isRootPage: true });
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
      name: 'Connect Your Google Calendar',
      type: ProfileIncompleteField.google_calendar_integrated,
      isComplete: false,
      onClick: () => {
        app.getRootNav().push(PageNames.Settings);
      }
    }
  ];

  for (const key of profileCompleteness.keys()) {
    profileIncomplete[key].isComplete = Boolean(profileCompleteness[key]);
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
