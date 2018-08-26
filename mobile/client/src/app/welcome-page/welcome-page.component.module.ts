import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WelcomePageComponent } from './welcome-page.component';
import { CoreModule } from '~/core/core.module';

@NgModule({
  declarations: [
    WelcomePageComponent
  ],
  imports: [
    IonicPageModule.forChild(WelcomePageComponent),
    CoreModule
  ]
})
export class WelcomePageComponentModule {}
