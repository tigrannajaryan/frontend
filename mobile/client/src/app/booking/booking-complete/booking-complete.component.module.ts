import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { CoreModule } from '~/core/core.module';
import { BookingCompleteComponent } from './booking-complete.component';

@NgModule({
  declarations: [
    BookingCompleteComponent
  ],
  imports: [
    IonicPageModule.forChild(BookingCompleteComponent),
    CoreModule
  ]
})
export class BookingCompleteComponentModule {}
