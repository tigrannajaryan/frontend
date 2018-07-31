import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { CoreModule } from '~/core/core.module';

import { BookingCompletePageComponent } from '~/booking-complete-page/booking-complete-page.component';

@NgModule({
  declarations: [
    BookingCompletePageComponent
  ],
  imports: [
    IonicPageModule.forChild(BookingCompletePageComponent),
    CoreModule
  ]
})
export class BookingCompletePageComponentModule {}
