import { NgModule } from '@angular/core';

import { ServerStatusComponent } from '~/shared/server-status/server-status.component';
import { UserHeaderComponent } from '~/today/user-header/user-header.component';
import { UserFooterComponent } from '~/today/user-footer/user-footer.component';

import { MadeNavComponent } from './made-nav/made-nav.component';
import { MadeTableComponent } from './made-table/made-table';
import { DirectivesModule } from '~/core/directives/directive.module';
import { IonicModule } from 'ionic-angular';
import { StoreModule } from '@ngrx/store';
import { serverStatusReducer, serverStatusStateName } from '~/shared/server-status/server-status.reducer';
import { UserHeaderMenuComponent } from '~/today/user-header/user-header-menu/user-header-menu.component';

const components = [
  MadeNavComponent,
  ServerStatusComponent,
  UserHeaderComponent,
  UserFooterComponent,
  MadeTableComponent,
  UserHeaderMenuComponent
];

@NgModule({
  declarations: [
    ...components
  ],
  entryComponents: [
    UserHeaderMenuComponent
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
