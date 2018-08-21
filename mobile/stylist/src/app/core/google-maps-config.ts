import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { LazyMapsAPILoaderConfigLiteral } from '@agm/core';

import { Logger } from '~/shared/logger';
import { EventTypes } from '~/core/events/event-types';

enum GoogleMapsLibraries {
  PLACES = 'places'
}

@Injectable()
export class GoogleMapsConfig implements LazyMapsAPILoaderConfigLiteral {

  apiKey: string;
  readonly libraries = [GoogleMapsLibraries.PLACES];

  constructor(
    private events: Events,
    private logger: Logger
  ) {
    this.events.subscribe(EventTypes.UPDATE_GMAP_KEY, apiKey => {
      this.logger.info('GoogleMapsConfig received api key=', apiKey);
      this.apiKey = apiKey;
      this.events.unsubscribe(EventTypes.UPDATE_GMAP_KEY);
    });
  }
}
