import {
    FieldPolicy,
    Reference,
  } from '@apollo/client';

  type KeyArgs = FieldPolicy<any>['keyArgs'];
  // A basic field policy that uses options.args.{offset,limit} to splice
  // the incoming data into the existing array. If your arguments are called
  // something different (like args.{start,count}), feel free to copy/paste
  // this implementation and make the appropriate changes.
  export function startLimitPagination<T = Reference>(
    keyArgs: KeyArgs = false,
  ): FieldPolicy<T[]> {
    return {
      keyArgs,
      merge(existing: any[], incoming: any[], {args, readField}) {
        if  (!args || !args.hasOwnProperty('start')) {
          return incoming;
        }
        const merged = existing ? existing.slice(0) : [];
        // Obtain a Set of all existing task IDs.
        const existingIdSet = new Set(
          merged.map(task => readField("id", task)));
        // Remove incoming tasks already present in the existing data.
        incoming = incoming.filter(
          task => !existingIdSet.has(readField("id", task)));
        // Find the index of the task just before the incoming page of tasks.
        const afterIndex = merged.findIndex(
          task => args.afterId === readField("id", task));
        if (afterIndex >= 0) {
          // If we found afterIndex, insert incoming after that index.
          merged.splice(afterIndex + 1, 0, ...incoming);
        } else {
          // Otherwise insert incoming at the end of the existing data.
          merged.push(...incoming);
        }
        return merged;
      },
    };
  }