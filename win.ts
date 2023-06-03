
function pwstrFromFfi(ptr: Deno.PointerValue): string | null {
    if (ptr === null) {
      return null;
    }
    let res = "";
    const view = new Deno.UnsafePointerView(ptr);
    for (let i = 0;; i += 2) {
      const code = view.getUint16(i);
      if (code === 0) {
        break;
      }
      res += String.fromCharCode(code);
    }
    return res;
  }
  
  export function pwstrToFfi(
    str: string | Uint8Array | Uint16Array | null,
  ): Uint8Array | null {
    if (str === null) {
      return null;
    }
    if (str instanceof Uint8Array) {
      return str;
    }
    if (str instanceof Uint16Array) {
      return new Uint8Array(str.buffer);
    }
    return new Uint8Array(
      new Uint16Array(new TextEncoder().encode(str + "\0")).buffer,
    );
  }
  
  export function toPointer(
    v: Deno.PointerValue | Uint8Array | null,
  ): Deno.PointerValue {
    if (v === null) {
      return null;
    } else if (
      typeof v === "object" && Object.getPrototypeOf(v) !== null &&
      v instanceof Uint8Array
    ) {
      return Deno.UnsafePointer.of(v);
    } else {
      return v as Deno.PointerValue;
    }
  }
  
  export function uuidToBytes(uuid: string): number[] {
    const bytes: number[] = [];
  
    uuid.replace(/[a-fA-F0-9]{2}/g, (hex: string): string => {
      bytes.push(parseInt(hex, 16));
      return "";
    });
  
    return bytes;
  }
  
  const shell32 = Deno.dlopen("shell32.dll", {
      "isCurrentUserAnAdmin": {
          "name": "IsUserAnAdmin",
          "parameters": [],
          "result": 'bool'
      },
      "getWellKnownFolder": {
          "name": "SHGetKnownFolderPath",
          result : 'pointer',
          parameters: ['pointer', 'u32', 'pointer', 'pointer']
      }
  });
  
  const kernel32 = Deno.dlopen("kernel32.dll", {
      "getLastError": {
          "name": "GetLastError",
          "parameters": [],
          "result": 'i32'
      },
      "setLastError": {
          "name": "SetLastError",
          "parameters": ['i32'],
          "result": 'void'
      }
  });
  
  const ole32 = Deno.dlopen("ole32.dll", {
       CLSIDFromString: {
        parameters: ["buffer", "pointer"],
        result: "pointer"
      }
  })
  
  const secur32 = Deno.dlopen("secur32.dll", {
      "getUserName": {
          name: "GetUserNameExW",
          parameters: ['i32', 'buffer', 'pointer'],
          result: 'pointer',
      }
  });
  
  
  console.log(shell32.symbols.isCurrentUserAnAdmin());
  console.log(kernel32.symbols.getLastError());
  
  const z = Deno.UnsafePointer.create(0);
  
  function getFolder(guid: string, opt = 0) {
      const guidBuffer = new Uint8Array(16);
      const guidPtr = toPointer(guidBuffer);
      const pwstr = pwstrToFfi(guid);
      console.log(pwstr);
      console.log(Deno.UnsafePointer.value(guidPtr));
      const hr1 = ole32.symbols.CLSIDFromString(pwstr, guidPtr);
      console.log("hr1", Deno.UnsafePointer.value(hr1));
      const stringPtr = Deno.UnsafePointer.create(0);
      console.log(Deno.UnsafePointer.value(guidPtr));
  
      const hr = shell32.symbols.getWellKnownFolder(guidPtr, opt, z, stringPtr);
      console.log(Deno.UnsafePointer.value(hr));
      
      const str = pwstrFromFfi(stringPtr);
      console.log(str);
  }
  
  console.log(getFolder('905e63b6-c1bf-494e-b29c-65b732d3d21a', 0));
  
  
  
  function getWinUserName()
  {
      let attempts = 0;
      let nameBuffer = new Uint8Array(4); // start with 4
      const sizeArrayBuffer = new ArrayBuffer(4);
      const sizeBuffer = new Uint8Array(sizeArrayBuffer);
      while(true)
      {
          if (attempts > 10)
              return "";
          const successPtr = secur32.symbols.getUserName(2, pwstrToFfi(nameBuffer), toPointer(sizeBuffer));
          const success = Deno.UnsafePointer.value(successPtr);
  
          if (success === 1)
          {
              return new TextDecoder().decode(nameBuffer);
          }
  
          const e = kernel32.symbols.getLastError();
  
          // 234 needz moar data
          if (e === 234)
          {
              const size = new DataView(sizeArrayBuffer).getInt32(0, true);
              nameBuffer = new Uint8Array(size * 2);
              attempts++;
              continue;
          }
  
          return "";
      }
  }
  
  
  console.log(getWinUserName());
  
  
  
  
  // https://koffi.dev/index
  
  // Secur32.GetUserNameExW  get username
  // Interop.Advapi32.LookupAccountNameW
  // Interop.Shell32.SHGetKnownFolderPath((Guid)folderId, (uint)option, IntPtr.Zero, out string path)
  // Interop.Kernel32.GetComputerName()  computer name
  // Interop.Kernel32.IsWow64Process(Interop.Kernel32.GetCurrentProcess(), out bool isWow64) && isWow64;
  
  /**
   * 
   * 
  
          [LibraryImport(Libraries.Secur32, SetLastError = true, StringMarshalling = StringMarshalling.Utf16)]
          internal static partial BOOLEAN GetUserNameExW(int NameFormat, ref char lpNameBuffer, ref uint lpnSize);
  
          internal const int NameSamCompatible = 2;
   * OperatingSystem
   * if (Interop.NtDll.RtlGetVersionEx(out Interop.NtDll.RTL_OSVERSIONINFOEX osvi) != 0)
              {
                  throw new InvalidOperationException(SR.InvalidOperation_GetVersion);
              }
  
              var version = new Version((int)osvi.dwMajorVersion, (int)osvi.dwMinorVersion, (int)osvi.dwBuildNumber, 0);
  
              return osvi.szCSDVersion[0] != '\0' ?
                  new OperatingSystem(PlatformID.Win32NT, version, new string(&osvi.szCSDVersion[0])) :
                  new OperatingSystem(PlatformID.Win32NT, version);
   * 
   */
  
  /*
   /// <summary>
          /// Gets the last system error on the current thread.
          /// </summary>
          /// <returns>The last system error.</returns>
          /// <remarks>
          /// The error is that for the current operating system (for example, errno on Unix, GetLastError on Windows).
          /// </remarks>
          public static int GetLastSystemError()
          {
              return Interop.Kernel32.GetLastError();
          }
  
          /// <summary>
          /// Sets the last system error on the current thread.
          /// </summary>
          /// <param name="error">The error to set.</param>
          /// <remarks>
          /// The error is that for the current operating system (for example, errno on Unix, SetLastError on Windows).
          /// </remarks>
          public static void SetLastSystemError(int error)
          {
              Interop.Kernel32.SetLastError(error);
          }
  
          /// <summary>
          /// Gets the system error message for the supplied error code.
          /// </summary>
          /// <param name="error">The error code.</param>
          /// <returns>The error message associated with <paramref name="error"/>.</returns>
          public static string GetPInvokeErrorMessage(int error)
          {
              return Interop.Kernel32.GetMessage(error);
          }
  
  
           /// <summary>
          /// Gets the last system error on the current thread.
          /// </summary>
          /// <returns>The last system error.</returns>
          /// <remarks>
          /// The error is that for the current operating system (for example, errno on Unix, GetLastError on Windows).
          /// </remarks>
          public static int GetLastSystemError()
          {
              return Interop.Sys.GetErrNo();
          }
  
          /// <summary>
          /// Sets the last system error on the current thread.
          /// </summary>
          /// <param name="error">The error to set.</param>
          /// <remarks>
          /// The error is that for the current operating system (for example, errno on Unix, SetLastError on Windows).
          /// </remarks>
          public static void SetLastSystemError(int error)
          {
              Interop.Sys.SetErrNo(error);
          }
  
          /// <summary>
          /// Gets the system error message for the supplied error code.
          /// </summary>
          /// <param name="error">The error code.</param>
          /// <returns>The error message associated with <paramref name="error"/>.</returns>
          public static string GetPInvokeErrorMessage(int error)
          {
              return Interop.Sys.StrError(error);
          }
  
  
          [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
          internal unsafe struct OSVERSIONINFOEX
          {
              public int dwOSVersionInfoSize;
              public int dwMajorVersion;
              public int dwMinorVersion;
              public int dwBuildNumber;
              public int dwPlatformId;
              public fixed char szCSDVersion[128];
              public ushort wServicePackMajor;
              public ushort wServicePackMinor;
              public ushort wSuiteMask;
              public byte wProductType;
              public byte wReserved;
          }
  
      [StructLayout(LayoutKind.Sequential)]
          internal struct SYSTEM_INFO
          {
              internal ushort wProcessorArchitecture;
              internal ushort wReserved;
              internal int dwPageSize;
              internal IntPtr lpMinimumApplicationAddress;
              internal IntPtr lpMaximumApplicationAddress;
              internal IntPtr dwActiveProcessorMask;
              internal int dwNumberOfProcessors;
              internal int dwProcessorType;
              internal int dwAllocationGranularity;
              internal short wProcessorLevel;
              internal short wProcessorRevision;
          }
  
          internal const int PROCESSOR_ARCHITECTURE_INTEL = 0;
          internal const int PROCESSOR_ARCHITECTURE_ARM = 5;
          internal const int PROCESSOR_ARCHITECTURE_AMD64 = 9;
          internal const int PROCESSOR_ARCHITECTURE_ARM64 = 12;
  
          [StructLayout(LayoutKind.Sequential)]
          internal struct SECURITY_ATTRIBUTES
          {
              internal uint nLength;
              internal unsafe void* lpSecurityDescriptor;
              internal BOOL bInheritHandle;
          }
  
          [LibraryImport(Libraries.Kernel32)]
          [SuppressGCTransition]
          internal static partial void SetLastError(int errorCode);
  
          [LibraryImport(Libraries.Kernel32, EntryPoint = "WriteConsoleW",  SetLastError = true, StringMarshalling = StringMarshalling.Utf16)]
          [return: MarshalAs(UnmanagedType.Bool)]
          internal static unsafe partial bool WriteConsole(
              IntPtr hConsoleOutput,
              byte* lpBuffer,
              int nNumberOfCharsToWrite,
              out int lpNumberOfCharsWritten,
  
  
              IntPtr lpReservedMustBeNull);
  
              \\\\.\\nul
  */