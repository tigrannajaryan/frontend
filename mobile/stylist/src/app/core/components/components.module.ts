import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { StoreModule } from '@ngrx/store';

import { serverStatusReducer, serverStatusStateName } from '~/shared/server-status/server-status.reducer';
import { ServerStatusComponent } from '~/shared/server-status/server-status.component';
import { UserHeaderComponent } from '~/today/user-header/user-header.component';
import { UserFooterComponent } from '~/today/user-footer/user-footer.component';

import { MadeNavComponent } from './made-nav/made-nav.component';
import { MadeTableComponent } from './made-table/made-table';
import { MadeLinkDirective } from './made-link/made-link';

@NgModule({
  declarations: [
    MadeNavComponent,
    ServerStatusComponent,
    UserHeaderComponent,
    UserFooterComponent,
    MadeTableComponent,
    MadeLinkDirective,
    ServerStatusComponent
  ],
  imports: [
    IonicModule,

    // Register reducers for serverStatus
    StoreModule.forFeature(serverStatusStateName, serverStatusReducer)
  ],
  exports: [
    MadeNavComponent,
    ServerStatusComponent,
    UserHeaderComponent,
    UserFooterComponent,
    MadeTableComponent,
    MadeLinkDirective,
    ServerStatusComponent
  ]
})
export class ComponentsModule { }
