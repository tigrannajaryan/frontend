import { AlertController } from 'ionic-angular';

export function showAlert(alertCtrl: AlertController, title: string, subTitle: string): void {
  const alert = alertCtrl.create({
    title,
    subTitle,
    buttons: ['Dismiss']
  });
  alert.present();
}
