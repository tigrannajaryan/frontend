import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { PriceCalendarComponent } from '~/shared/components/price-calendar/price-calendar.component';

import { CoreModule } from '~/core/core.module';
import { ServicesServiceMock } from '~/core/api/services-service.mock';

import { SelectDateComponent } from '~/booking/select-date/select-date.component';

@NgModule({
  declarations: [
    PriceCalendarComponent,
    SelectDateComponent
  ],
  imports: [
    IonicPageModule.forChild(SelectDateComponent),
    CoreModule
  ],
  providers: [
    // TODO: later remove
    ServicesServiceMock
  ]
})
export class SelectDateComponentModule {}
