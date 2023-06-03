/**
 * Provides os constants to navigate dealing with os specific code or modules such as
 * OS_FAMILY, IS_WINDOWS, IS_LINUX, IS_UNIX, IS_DARWIN.
 * 
 * @module 
 */
import ffi from 'npm:ffi-napi';


export type OsFamily =
    | 'linux'
    | 'darwin'
    | 'windows'
    | 'sunos'
    | 'freebsd'
    | 'openbsd'
    | 'netbsd'
    | 'aix'
    | 'solaris'
    | 'illumos'
    | 'unknown';

let osFamily: OsFamily = 'unknown';
let osValue = 'unknown';

// deno-lint-ignore no-explicit-any
const g = globalThis as any;

let userIsAdmin = () => false;
let userIsRoot = () => false;

if (g.process)
{
    osValue = g.process.platform;
    let fam = g.process.platform;
    if (fam === 'win32')
       fam = 'windows';

    osFamily = fam;

    userIsRoot = () => g.process.getuid() === 0;

    if (osFamily === 'windows')
    {
        const shell32 = ffi.Library('shell32.dll', {
            'IsUserAnAdmin': [ 'bool', [  ] ]
        });

        userIsAdmin = () => shell32.IsUserAnAdmin(); 
    }
}
else if (g.window && g.navigator) {
    let fam = 'unknown';
    if (g.navigator.userAgentData) {
        osValue = g.navigator.userAgentData.platform;
        fam = osValue.toLowerCase();
    } else {
        osValue = g.navigator.platform;
        fam = osValue.split(' ')[0].toLowerCase();
    }

    switch(fam)
    {
        case 'macintel':
        case 'macintosh':
        case 'darwin':
        case 'ios':
        case 'osx':
        case 'mac':
        case 'macos':
        case 'macppc':
        case 'mac68k':
        case 'iphone':
        case 'ipad':
        case 'ipod':
            fam = 'darwin';
            break;

        case 'win32':
        case 'win16':
        case 'wince':
        case 'windows':
            fam = 'windows';
            break;

        case 'linux':
        case 'android':
            fam = 'linux';
            break;

        case 'freebsd':
        case 'openbsd':
        case 'netbsd':
        case 'sunos':
            break;

        default:
            fam = 'unknown';
            break;
    }

    osFamily = fam as unknown as OsFamily;
}

if (osFamily === 'windows' && g.Deno && g.Deno.dlopen)
{
    const shell = Deno.dlopen('shell32.dll', {
        "IsUserAnAdmin": {
            "result": "bool",
            parameters: []
        } 
    });
}




export const OS_RAW = osValue;
export const IS_WINDOWS = osFamily === 'windows';
export const IS_DARWIN = osFamily === 'darwin';
export const IS_LINUX = osFamily === 'linux';
export const IS_UNIX = !IS_WINDOWS;
export const OS_FAMILY = osFamily;
export const NEW_LINE = IS_WINDOWS ? '\r\n' : '\n';
export const PATH_SEPARATOR = IS_WINDOWS ? ';' : ':';
export const PATH_SEPARATOR_REGEX = IS_WINDOWS ? /[;]+/ : /[:]+/;
export const DIR_SEPARATOR = IS_WINDOWS ? '\\' : '/';
export const DIR_SEPARATOR_REGEX = IS_WINDOWS ? /[\\]+/ : /[/]+/;
export const DEV_NULL = IS_WINDOWS ? 'NUL' : '/dev/null';

export const ENV_VAR_NAMES : Record<string, string> = {
    PATH: IS_WINDOWS ? 'Path' : 'PATH',
    HOME: IS_WINDOWS ? 'USERPROFILE' : 'HOME',
    TEMP: IS_WINDOWS ? 'TEMP' : 'TMPDIR',
    SHELL: IS_WINDOWS ? 'COMSPEC' : 'SHELL',
    USER: IS_WINDOWS ? 'USERNAME' : 'USER',
    HOME_CONFIG: IS_WINDOWS ? 'APPDATA' : 'XDG_CONFIG_HOME',
    HOME_CACHE: IS_WINDOWS ? 'LOCALAPPDATA' : 'XDG_CACHE_HOME',
    HOME_DATA: IS_WINDOWS ? 'LOCALAPPDATA' : 'XDG_DATA_HOME',
}

export function userIsElevated() {
    if (IS_WINDOWS) {
        return userIsAdmin();
    }
    return userIsRoot();
}




