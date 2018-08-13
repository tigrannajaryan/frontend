import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UiComponent } from './ui.component';
import { CoreModule } from '~/core/core.module';

@NgModule({
  declarations: [
    UiComponent
  ],
  imports: [
    IonicPageModule.forChild(UiComponent),
    CoreModule
  ]
})
export class UiComponentModule {}
