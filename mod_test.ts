import * as assert from "https://deno.land/x/bearzsh_assertions@0.1.0/mod.ts";
import { 
    IS_WINDOWS, 
    IS_LINUX, 
    IS_DARWIN,
    IS_UNIX,
    OS_FAMILY,
    NEW_LINE,
    PATH_SEPARATOR,
    DIR_SEPARATOR,
} from './mod.ts';


Deno.test("os constants", () => {
    // deno-lint-ignore no-explicit-any
    const g = globalThis as any;
    let os = 'unknown';
    if (g.Deno && g.Deno.internal)
    {
        os = g.Deno.build.os;
    } 
    else if (g.process)
    {
        let fam = g.process.platform;
        if (fam === 'win32')
        fam = 'windows';
        os = fam;
    }

    assert.strictEquals(IS_WINDOWS, os === 'windows');
    assert.strictEquals(IS_LINUX, os === 'linux');
    assert.strictEquals(IS_DARWIN, os === 'darwin');
    assert.strictEquals(IS_UNIX, os !== 'windows');
    assert.strictEquals(OS_FAMILY, os);
    assert.strictEquals(NEW_LINE, IS_WINDOWS ? '\r\n' : '\n');
    assert.strictEquals(PATH_SEPARATOR, IS_WINDOWS ? ';' : ':');
    assert.strictEquals(DIR_SEPARATOR, IS_WINDOWS ? '\\' : '/');
});