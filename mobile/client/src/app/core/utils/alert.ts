import { AlertController } from 'ionic-angular';
import { AppModule } from '~/app.module';

interface AlertBtn {
  text: string;
  handler(): any;
}

export function showAlert(title: string, subTitle: string, addBtns: AlertBtn[] = []): void {
  const alertCtrl = AppModule.injector.get(AlertController);
  const alert = alertCtrl.create({
    title,
    subTitle,
    buttons: ['Dismiss', ...addBtns]
  });
  alert.present();
}
