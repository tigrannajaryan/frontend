import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SelectTimeComponent } from './select-time.component';
import { CoreModule } from '~/core/core.module';

@NgModule({
  declarations: [
    SelectTimeComponent
  ],
  imports: [
    IonicPageModule.forChild(SelectTimeComponent),
    CoreModule
  ]
})
export class SelectTimeComponentModule {}
