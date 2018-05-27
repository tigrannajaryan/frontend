import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { StoreModule } from '@ngrx/store';

import { BbLinkComponent } from './bb-link/bb-link';
import { BbNavComponent } from './bb-nav/bb-nav';
import { BbTable } from './bb-table/bb-table';

import { serverStatusReducer, serverStatusStateName } from './server-status/server-status.reducer';
import { ServerStatusComponent } from './server-status/server-status.component';

@NgModule({
  declarations: [
    BbLinkComponent,
    BbNavComponent,
    BbTable,
    ServerStatusComponent
  ],
  imports: [
    IonicModule,

    // Register reducers for serverStatus
    StoreModule.forFeature(serverStatusStateName, serverStatusReducer)
  ],
  exports: [
    BbLinkComponent,
    BbNavComponent,
    BbTable,
    ServerStatusComponent
  ]
})
export class ComponentsModule { }
