import { AppModule } from '~/app.module';
import { AlertController } from 'ionic-angular';
// Init educational alerts

export interface EducationInfo {
  isShowedFutureAppointmentHelp?: boolean;
  isShowedTodayHelp?: boolean;
}

export enum EducationalActionsTypes {
  SHOW_FUTURE_APPOINTMENTS = 'SHOW_FUTURE_APPOINTMENTS',
  SHOW_TODAY_HELP = 'SHOW_TODAY_HELP'
}

export function initEducationalInfo(): void {
  // if we have no educational object, create it
  if (!localStorage.getItem('education')) {
    const education: EducationInfo = {
      isShowedFutureAppointmentHelp: true,
      isShowedTodayHelp: true
    };
    localStorage.setItem('education', JSON.stringify(education));
  }
}

export function showEducationAlert(educationalTypes: EducationalActionsTypes): void {
  const education = JSON.parse(localStorage.getItem('education')) as EducationInfo;
  const alertCtrl = AppModule.injector.get(AlertController);

  switch (educationalTypes) {
    case EducationalActionsTypes.SHOW_FUTURE_APPOINTMENTS:
      return showFutureAppointment(alertCtrl, education);
    case EducationalActionsTypes.SHOW_TODAY_HELP:
      return showTodayHelp(alertCtrl, education);

    default:
      return undefined;
  }
}

function showFutureAppointment(alertCtrl: AlertController, education: EducationInfo): void {
  if (education && education.isShowedFutureAppointmentHelp) {
    const alert = alertCtrl.create({
      subTitle: `You added an appointment for a future day, it will not be visible on this screen.
          You can see future appointments by tapping Total This Week`,
      buttons: [
        {
          text: 'Don\'t show again',
          handler: () => {
            education.isShowedFutureAppointmentHelp = false;
            localStorage.setItem('education', JSON.stringify(education));
          }
        },
        'Ok'
      ]
    });
    alert.present();
  }
}

function showTodayHelp(alertCtrl: AlertController, education: EducationInfo): void {
  if (education && education.isShowedTodayHelp) {
    education.isShowedTodayHelp = true;
    localStorage.setItem('education', JSON.stringify(education));

    const alert = alertCtrl.create({
      subTitle: `Congratulations! You completed your registration. This is your home screen where you
           will see all appointments for today, can add new appointments. Tap on the icons below to edit your settings`,
      buttons: ['Ok']
    });
    alert.present();
  }
}
