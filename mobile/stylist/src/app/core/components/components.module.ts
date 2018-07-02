import { NgModule } from '@angular/core';

import { ServerStatusComponent } from '~/shared/server-status/server-status.component';
import { UserHeaderComponent } from '~/core/components/user-header/user-header.component';
import { UserFooterComponent } from '~/core/components/user-footer/user-footer.component';

import { MadeNavComponent } from './made-nav/made-nav.component';
import { MadeTableComponent } from './made-table/made-table';
import { DirectivesModule } from '~/core/directives/directive.module';
import { IonicModule } from 'ionic-angular';
import { StoreModule } from '@ngrx/store';
import { serverStatusReducer, serverStatusStateName } from '~/shared/server-status/server-status.reducer';
import { UserHeaderMenuComponent } from '~/core/components/user-header/user-header-menu/user-header-menu.component';
import { ServicesPickComponent } from '~/core/components/services-pick/services-pick.component';
import { AppointmentItemComponent } from '~/core/components/appointment-item/appointment-item.component';

const components = [
  MadeNavComponent,
  ServerStatusComponent,
  UserHeaderComponent,
  UserFooterComponent,
  MadeTableComponent,
  UserHeaderMenuComponent,
  ServicesPickComponent,
  AppointmentItemComponent
];

@NgModule({
  declarations: [
    ...components
  ],
  entryComponents: [
    UserHeaderMenuComponent,
    ServerStatusComponent,
    ServicesPickComponent
  ],
  imports: [
    IonicModule,

    // Register reducers for serverStatus
    StoreModule.forFeature(serverStatusStateName, serverStatusReducer),

    DirectivesModule
  ],
  exports: [
    ...components
  ]
})
export class ComponentsModule { }
