# Bearz-Sh OS

Provides os constants to navigate dealing with os specific code or modules such as
OS_FAMILY, IS_WINDOWS, IS_LINUX, IS_UNIX, IS_DARWIN.

## Deno Example

```ts
import {
    IS_WINDOWS, 
    IS_LINUX, 
    IS_DARWIN,
    OS_FAMILY,
    NEW_LINE,
    PATH_SEPARATOR,
    DIR_SEPARATOR,
} from "https://deno.land/x/bearzsh_os@MOD_VERSION/mod.ts";

console.log(IS_WINDOWS);
console.log(IS_LINUX);
console.log(IS_DARWIN);
console.log(NEW_LINE);
console.log(PATH_SEPARATOR);
console.log(DIR_SEPARATOR);
console.log(OS_FAMILY);
```

## Node Example

```ts
import {
    IS_WINDOWS, 
    IS_LINUX, 
    IS_DARWIN,
    OS_FAMILY,
    NEW_LINE,
    PATH_SEPARATOR,
    DIR_SEPARATOR,
} from "@bearz-sh/os";

console.log(IS_WINDOWS);
console.log(IS_LINUX);
console.log(IS_DARWIN);
console.log(NEW_LINE);
console.log(PATH_SEPARATOR);
console.log(DIR_SEPARATOR);
console.log(OS_FAMILY);
```

## LICENSE

MIT
