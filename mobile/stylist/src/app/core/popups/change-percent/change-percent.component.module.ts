import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChangePercentComponent } from './change-percent.component';
import { CoreModule } from '~/core/core.module';

@NgModule({
  imports: [
    IonicPageModule.forChild(ChangePercentComponent),
    CoreModule
  ],
  declarations: [
    ChangePercentComponent
  ],
  entryComponents: [
    ChangePercentComponent
  ]
})
export class DiscountsChangeModule {}
