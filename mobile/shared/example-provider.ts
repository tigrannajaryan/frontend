import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/**
 * Example provider that is sharable between mobile apps.
 * TODO: delete.
 */
@Injectable()
export class ExampleSharedProvider {

  str = 'text';

  constructor(public http: HttpClient) {
    // tslint:disable-next-line:no-console
    console.log('Hello SharedProvider Provider');
  }

}
