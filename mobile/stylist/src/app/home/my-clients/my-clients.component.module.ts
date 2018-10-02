import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { CoreModule } from '~/core/core.module';
import { MyClientsComponent } from '~/home/my-clients/my-clients.component';

@NgModule({
  declarations: [
    MyClientsComponent
  ],
  imports: [
    IonicPageModule.forChild(MyClientsComponent),
    CoreModule
  ]
})
export class MyClientsComponentModule {}
