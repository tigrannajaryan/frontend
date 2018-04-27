import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { OnDestroy } from '@angular/core';

/**
 * Wrap default subscribe function
 * and add feature to auto unsubscribe on ngOnDestroy
 */

export class BaseComponent implements OnDestroy {
    private _subscriptions: Subscription[] = [];
    public ngOnDestroy(): void {
        for (const sub of this._subscriptions) {
            sub.unsubscribe();
        }
    }

    public markForSafeDelete(sub: any): void {
        this._subscriptions.push(sub);
    }
}

export function safeSubscribe<T>(this: Observable<T>, component: BaseComponent,
                                 next?: (value: T) => void, error?: (error: T) => void, complete?: () => void): Subscription {
    const sub = this.subscribe(next, error, complete);
    component.markForSafeDelete(sub);

    return sub;
}
Observable.prototype.safeSubscribe = safeSubscribe;

declare module 'rxjs/Observable' {
    interface Observable<T> {
        safeSubscribe: typeof safeSubscribe;
    }
}
