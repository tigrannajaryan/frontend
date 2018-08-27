export class PromiseError {
  constructor(readonly error) { }
}

/**
 * Creates a Promise that completes when the array of Promise parameters all
 * completes or rejects. This is similar to Promise.all() however the difference
 * is that the rejection of any one promise causes Promise.all() to reject immediately
 * while async_all does not have this behavior, it always completes after every
 * promise is either completed or rejected.
 *
 * The rejected promise errors are wrapped in PromiseError class for easier detection.
 * async_all is useful when you need to execute multiple operations in parallel and
 * must wait for all of them to complete or fail before you proceed.
 *
 * Here is the typical usage:
 *  const [operation1, operation2] = await async_all([
 *    doOperation1(),
 *    doOperation2()
 *  ]);
 *  if (operation1 instanceof PromiseError) {
 *    // Promise for operation1 was rejected.
 *    console.error(operation1.error);
 *  } else {
 *    // doOperation1() completed, use it. operation1 contains the result.
 *    console.log(operation1);
 *  }
 *  // Handle operation2 similarly.
 *  ...
 *
 * @param promises array of Promises
 * @returns a Promise of arrays
 */
export function async_all<T1, T2>(promises: [Promise<T1>, Promise<T2>]): Promise<[T1 | PromiseError, T2 | PromiseError]> {
  const [p1, p2] = promises;
  return Promise.all([
    p1.catch(e => new PromiseError(e)),
    p2.catch(e => new PromiseError(e))
  ]);
}
