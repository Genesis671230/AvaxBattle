/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// eslint-disable-next-line @typescript-eslint/no-var-requires
import AggregateError from "aggregate-error";

export default async function promiseWithConcurrency<T, K>(
  iterable: K,
  mapper: (arg0: any, arg1: number) => any,
  { concurrency = Number.POSITIVE_INFINITY, stopOnError = true } = {}
): Promise<T | unknown> {
  return new Promise((resolve, reject_) => {
    if (typeof mapper !== "function") {
      throw new TypeError("Mapper function is required");
    }

    if (
      !(
        (Number.isSafeInteger(concurrency) ||
          concurrency === Number.POSITIVE_INFINITY) &&
        concurrency >= 1
      )
    ) {
      throw new TypeError(
        `Expected \`concurrency\` to be an integer from 1 and up or \`Infinity\`, got \`${concurrency}\` (${typeof concurrency})`
      );
    }

    const result: Array<T | PromiseLike<T>> = [];
    const errors: Array<unknown> = [];
    const skippedIndexesMap = new Map();
    let isRejected = false;
    let isResolved = false;
    let isIterableDone = false;
    let resolvingCount = 0;
    let currentIndex = 0;
    const iterator =
      //@ts-ignore
      iterable[Symbol.iterator] === undefined
        ? //@ts-ignore
          iterable[Symbol.asyncIterator]()
        : //@ts-ignore
          iterable[Symbol.iterator]();

    const reject = (reason: any) => {
      isRejected = true;
      isResolved = true;
      reject_(reason);
    };

    const next = async () => {
      if (isResolved) {
        return;
      }

      const nextItem = await iterator.next();

      const index = currentIndex;
      currentIndex++;

      if (nextItem.done) {
        isIterableDone = true;

        if (resolvingCount === 0 && !isResolved) {
          if (!stopOnError && errors.length > 0) {
            reject(new AggregateError(errors));
            return;
          }

          isResolved = true;

          if (skippedIndexesMap.size === 0) {
            resolve(result);
            return;
          }

          const pureResult = [];
          for (const [index, value] of Array.from(result.entries())) {
            if (skippedIndexesMap.get(index) === promiseConcurrencySkip) {
              continue;
            }

            pureResult.push(value);
          }

          resolve(pureResult);
        }

        return;
      }

      resolvingCount++;

      (async () => {
        try {
          const element = await nextItem.value;

          if (isResolved) {
            return;
          }

          const value = await mapper(element, index);

          if (value === promiseConcurrencySkip) {
            skippedIndexesMap.set(index, value);
          }

          result[index] = value;

          resolvingCount--;
          await next();
        } catch (error) {
          if (stopOnError) {
            reject(error);
          } else {
            errors.push(error);
            resolvingCount--;
            try {
              await next();
            } catch (error) {
              reject(error);
            }
          }
        }
      })();
    };

    (async () => {
      for (let index = 0; index < concurrency; index++) {
        try {
          // eslint-disable-next-line no-await-in-loop
          await next();
        } catch (error) {
          reject(error);
          break;
        }

        if (isIterableDone || isRejected) {
          break;
        }
      }
    })();
  });
}

export const promiseConcurrencySkip = Symbol("skip");
