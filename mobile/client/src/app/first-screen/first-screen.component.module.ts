import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FirstScreenComponent } from './first-screen.component';
import { CoreModule } from '~/core/core.module';

@NgModule({
  declarations: [
    FirstScreenComponent
  ],
  imports: [
    IonicPageModule.forChild(FirstScreenComponent),
    CoreModule
  ]
})
export class FirstScreenComponentModule {}
