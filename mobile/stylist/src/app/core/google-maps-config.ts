import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { LazyMapsAPILoaderConfigLiteral } from '@agm/core';

@Injectable()
export class GoogleMapsConfig implements LazyMapsAPILoaderConfigLiteral {

  apiKey: string;
  readonly  libraries = ['places'];

  constructor(private events: Events) {
    this.events.subscribe('profile:gmapKey', data => {
      this.apiKey = data;
    });
  }
}
