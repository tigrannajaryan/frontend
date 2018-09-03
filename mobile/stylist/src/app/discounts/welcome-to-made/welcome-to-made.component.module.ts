import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WelcomeToMadeComponent } from './welcome-to-made.component';
import { CoreModule } from '~/core/core.module';

@NgModule({
  declarations: [
    WelcomeToMadeComponent
  ],
  imports: [
    IonicPageModule.forChild(WelcomeToMadeComponent),
    CoreModule
  ]
})
export class WelcomeToMadePageModule {}
