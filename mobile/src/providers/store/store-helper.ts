import { Injectable } from '@angular/core';
import { StoreService } from './store';

/**
 * StoreServiceHelper working with StoreService data
 * and returns an updated data back
 */
@Injectable()
export class StoreServiceHelper {
  constructor(private store: StoreService) {}

  /**
   * @param prop find it in store object
   * @param state data that sould be saved in store using prop
   */
  update(prop: string, state: any): void {
    const currentState = this.store.getState();
    const stateObj = { [prop]: state };
    this.store.setState({...currentState, ...stateObj});
  }

  /**
   * @param prop add it in store object
   * @param state data that sould be saved in store using prop
   */
  add(prop: string, state: any): void {
    const currentState = this.store.getState();
    const collection = currentState[prop];
    const stateObj = { [prop]: [state, ...collection] };
    this.store.setState({...currentState, ...stateObj});
  }

  /**
   * @param prop find and update it in store object
   * @param state data that sould be saved in store using prop
   */
  findAndUpdate(prop: string, state: any): void {
    const currentState = this.store.getState();
    const collection = currentState[prop];
    const stateObj = {[prop]: collection.map(item => {
        if (item.id !== state.id) {
          return item;
        }

        return {...item, ...state};
      })};

    this.store.setState({...currentState, ...stateObj});
  }

  /**
   * @param prop find and delete it from store object
   * @param id filter waht to delete using id
   */
  findAndDelete(prop: string, id: number): void {
    const currentState = this.store.getState();
    const collection = currentState[prop];
    const stateObj = {[prop]: collection.filter(item => item.id !== id)};
    this.store.setState({...currentState, ...stateObj});
  }
}
