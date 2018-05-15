import { NgModule } from '@angular/core';
import { BbNavComponent } from './bb-nav/bb-nav';
import { IonicModule } from 'ionic-angular';
import { StoreModule } from '@ngrx/store';

import { serverStatusReducer, serverStatusStateName } from './server-status/server-status.reducer';
import { ServerStatusComponent } from './server-status/server-status.component';

@NgModule({
  declarations: [
    BbNavComponent,
    ServerStatusComponent
  ],
  imports: [
    IonicModule,

    // Register reducers for serverStatus
    StoreModule.forFeature(serverStatusStateName, serverStatusReducer)
  ],
  exports: [
    BbNavComponent,
    ServerStatusComponent
  ]
})
export class ComponentsModule { }
