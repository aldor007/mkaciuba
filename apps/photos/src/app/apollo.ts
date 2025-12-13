/* eslint-disable @typescript-eslint/no-explicit-any */
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
      merge(existing: any[], incoming: any[], {args}) {
        if  (!args || !Object.prototype.hasOwnProperty.call(args, 'start')) {
          return incoming || existing;
        }
      const merged = existing ? existing.slice(0) : [];
      if (args) {
        // Assume an offset of 0 if args.offset omitted.
        const { start = 0 } = args;
        for (let i = 0; i < incoming.length; ++i) {
          merged[start + i] = incoming[i];
        }
      } else {
        // It's unusual (probably a mistake) for a paginated field not
        // to receive any arguments, so you might prefer to throw an
        // exception here, instead of recovering by appending incoming
        // onto the existing array.
        merged.push(...incoming);
      }
      return merged;
      },
      read(existing: any[], {args}) {
        // Return existing cached data - this prevents the canonizeResults warning
        return existing;
      },
    };
  }