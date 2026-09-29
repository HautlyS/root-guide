// Guide content for the Root Wizard.
// URLs in DOWNLOADS were verified reachable when this content was written.

export const DEVICES = [
  {
    id: 'j4',
    name: 'Galaxy J4 (2018)',
    codename: 'j4lte',
    soc: 'Exynos 7570 · 32-bit (armeabi-v7a)',
    os: 'Android 8.0 → 10 / One UI 2.0 (final)',
    rootTool: 'Magisk (only option — KernelSU/APatch are arm64-only)',
    models: ['SM-J400F', 'SM-J400G', 'SM-J400M'],
    status: 'ready',
    notes: [
      'Knox e-fuse trips permanently (Knox Warranty Void 0x1).',
      'Bootloader unlock and first Magisk install both factory-reset the phone.',
      '32-bit device: Magisk v30.7 verified to ship armeabi-v7a libs.'
    ]
  },
  {
    id: 'a50',
    name: 'Galaxy A50',
    codename: 'a50',
    soc: 'Exynos 9610 · 64-bit',
    os: 'Android 9 → 11 / One UI 3.1 (final)',
    rootTool: 'Magisk (KernelSU possible via custom kernel)',
    models: ['SM-A505F', 'SM-A505FN', 'SM-A505G', 'SM-A505GN', 'SM-A505GT'],
    status: 'planned',
    notes: ['Guide coming in a later release of this app.']
  }
]

export const DOWNLOADS = [
  {
    id: 'magisk',
    name: 'Magisk v30.7 (stable APK)',
    url: 'https://github.com/topjohnwu/Magisk/releases/download/v30.7/Magisk-v30.7.apk',
    what: 'Root manager + AP patcher. Universal APK, includes 32-bit libs.'
  },
  {
    id: 'odin',
    name: 'Odin3 (Windows)',
    url: 'https://dl2018.sammobile.com/Odin.zip',
    what: 'Samsung flashing tool — link used by Magisk’s official docs.'
  },
  {
    id: 'drivers',
    name: 'Samsung USB drivers',
    url: 'https://developer.samsung.com/android-usb-driver',
    what: 'Windows only. Install, then reboot the PC.'
  },
  {
    id: 'platform-tools',
    name: 'Google platform-tools (adb)',
    url: 'https://dl.google.com/android/repository/platform-tools-latest-windows.zip',
    what: 'Needed to pull the patched file — MTP corrupts large files.'
  },
  {
    id: 'samfirm',
    name: 'SamFirm.NET (firmware downloader, CLI)',
    url: 'https://github.com/jesec/SamFirm.NET/releases/download/v1.0.0/win-x64-single.exe',
    what: 'Downloads stock firmware straight from Samsung servers.'
  },
  {
    id: 'samfw',
    name: 'SamFW (firmware in the browser)',
    url: 'https://samfw.com/firmware/SM-J400F',
    what: 'Pick your model + CSC, download the full firmware zip.'
  },
  {
    id: 'twrp',
    name: 'TWRP 3.7.0_9 for j4lte',
    url: 'https://twrp.me/samsung/samsunggalaxyj4.html',
    what: 'Optional — only needed if you want custom ROMs later.'
  },
  {
    id: 'rmm',
    name: 'RMM State Bypass v3 (recovery flashable)',
    url: 'https://androidfilehost.com/?fid=8889791610682932422',
    what: 'Only if you hit the "Only official released binaries" lock.'
  },
  {
    id: 'heimdall',
    name: 'Heimdall (Linux flashing tool)',
    url: 'https://www.glassechidna.com.au/heimdall/',
    what: 'Linux alternative to Odin — flash partitions by name.'
  },
  {
    id: 'odin4linux',
    name: 'Odin 4 for Linux (XDA)',
    url: 'https://forum.xda-developers.com/t/official-samsung-odin-v4-1-2-1-dc05e3ea-for-linux.4453423/',
    what: 'Closest Linux equivalent to Windows Odin — same BL/AP/CP/CSC slots.'
  },
  {
    id: 'magisk-doc',
    name: 'Magisk official Samsung install doc',
    url: 'https://github.com/topjohnwu/Magisk/blob/master/docs/install.md',
    what: 'Upstream procedure this wizard follows.'
  }
]

export const RISKS = [
  'Unlocking the bootloader ERASES ALL DATA — photos, chats, apps. Back up first.',
  'The first Magisk install requires ANOTHER full data wipe (on top of the unlock wipe).',
  'KNOX e-fuse blows permanently: Samsung Pay, Secure Folder, warranty — gone forever, even if you return to stock.',
  'Banking / Google Wallet apps may refuse to run on a rooted, unlocked phone.',
  'A mismatched firmware file can bootloop the phone. Always flash firmware that matches your exact model and build.'
]

const L = (id) => DOWNLOADS.find((d) => d.id === id)

export const J4_GUIDE = {
  deviceId: 'j4',
  phases: [
    {
      id: 'start',
      title: 'Risks & plan',
      icon: '⚠️',
      steps: [
        {
          id: 'ack',
          title: 'Understand what you are about to do',
          lead: 'Read every line. Rooting is reversible for software, irreversible for Knox.',
          items: [
            ...RISKS.map((r) => ({ t: 'warn', v: r })),
            { t: 'text', v: 'This wizard tracks your progress in this browser only. Nothing is sent anywhere.' }
          ]
        },
        {
          id: 'plan',
          title: 'The 6 phases we will walk through',
          items: [
            { t: 'text', v: '1 · Tools — install drivers, adb, Odin, download firmware' },
            { t: 'text', v: '2 · Prepare — OEM unlock, USB debugging, Magisk installed, screen lock removed' },
            { t: 'text', v: '3 · Unlock bootloader — long-press Vol Up in Download mode (wipes phone)' },
            { t: 'text', v: '4 · Patch — Magisk patches the stock AP file on the phone' },
            { t: 'text', v: '5 · Flash — Odin writes patched AP + BL + CP + CSC, then factory reset' },
            { t: 'text', v: '6 · Finish — Magisk “additional setup”, verify root, post-root rules' },
            { t: 'text', v: 'Estimated time: 45–90 minutes depending on downloads.' },
            { t: 'check', v: 'I have backed up my data and accept the Knox and wipe consequences.' }
          ],
          verify: {
            q: 'Ready to start?',
            options: [
              { label: 'Yes, begin', ok: true },
              { label: 'I need to back up first', ok: false, help: 'Do that now — Google backup (Settings → Accounts → Backup), plus copy photos/WhatsApp to a PC or SD card. Come back when done.' }
            ]
          }
        }
      ]
    },
    {
      id: 'tools',
      title: 'Tools & firmware',
      icon: '🧰',
      steps: [
        {
          id: 'identify',
          title: 'Identify your exact model and build',
          lead: 'Firmware must match model AND build family. Wrong file = bootloop.',
          items: [
            { t: 'text', v: 'On the phone: Settings → About phone → Software information' },
            { t: 'field', key: 'model', label: 'Model number', type: 'select', options: ['SM-J400F', 'SM-J400G', 'SM-J400M'] },
            { t: 'field', key: 'build', label: 'Build number (e.g. J400FXXU9CUJ3)', type: 'text', placeholder: 'J400FXXU9CUJ3' },
            { t: 'text', v: 'Also note the CSC / region code if you know it (e.g. INS, XFE, SER) — shown in Settings → About phone → Baseband version.' },
            { t: 'check', v: 'I wrote down model + build number.' }
          ]
        },
        {
          id: 'install-pc',
          title: 'Set up the PC',
          lead: 'Use the Windows machine for flashing — it matches every J4 guide. Linux is fine for adb.',
          items: [
            { t: 'link', ref: 'drivers', check: true },
            { t: 'link', ref: 'platform-tools', check: true },
            { t: 'link', ref: 'odin', check: true },
            { t: 'cmd', v: 'adb version', hint: 'Run in the platform-tools folder (Shift+right-click → Open terminal here). Any version output = adb works.' },
            { t: 'check', v: 'Drivers installed, PC rebooted, adb answers.' }
          ],
          verify: {
            q: 'Does `adb version` print a version?',
            options: [
              { label: 'Yes', ok: true },
              { label: 'No / command not found', ok: false, help: 'Re-extract platform-tools, open the terminal inside that folder, or add it to PATH. On Linux use your package manager: sudo apt install adb' }
            ]
          }
        },
        {
          id: 'firmware',
          title: 'Download stock firmware',
          lead: 'You need the FULL firmware zip (AP, BL, CP, CSC, HOME_CSC).',
          items: [
            { t: 'link', ref: 'samfw', check: false },
            { t: 'link', ref: 'samfirm', check: false },
            { t: 'text', v: 'Search for your model (e.g. SM-J400F). Prefer the newest build equal to or newer than your current one, same region/CSC.' },
            { t: 'text', v: 'Extract the zip somewhere tidy — you will load 4 of the 5 files into Odin later. Keep it forever: it is your unbrick file.' },
            { t: 'check', v: 'Firmware extracted; I can see AP_, BL_, CP_, CSC_, HOME_CSC_ files.' }
          ],
          verify: {
            q: 'Does the extracted folder contain AP_, BL_, CP_ and CSC_ files?',
            options: [
              { label: 'Yes, all five', ok: true },
              { label: 'Only a single tar/md5', ok: false, help: 'You downloaded a single-file firmware. Re-download the 5-file (HOME_CSC) version — Odin needs the separate BL/CP/CSC.' }
            ]
          }
        },
        {
          id: 'get-magisk',
          title: 'Install the Magisk app on the phone',
          items: [
            { t: 'link', ref: 'magisk', check: true },
            { t: 'text', v: 'Copy the APK to the phone and install it (allow “install unknown apps” for your file manager if asked).' },
            { t: 'check', v: 'Magisk app opens on the phone.' }
          ]
        }
      ]
    },
    {
      id: 'prepare',
      title: 'Prepare the phone',
      icon: '📱',
      steps: [
        {
          id: 'dev-options',
          title: 'Enable Developer options, OEM unlocking, USB debugging',
          items: [
            { t: 'text', v: 'Settings → About phone → Software information → tap Build number 7 times.' },
            { t: 'text', v: 'Settings → Developer options → enable USB debugging.' },
            { t: 'text', v: 'Settings → Developer options → enable OEM unlocking.' },
            { t: 'warn', v: 'If OEM unlocking is missing: finish setup, connect to Wi‑Fi and wait — Samsung can delay it up to 7 days after a reset.' },
            { t: 'check', v: 'OEM unlocking is visible and switched on.' }
          ],
          verify: {
            q: 'Is the OEM unlocking toggle present?',
            options: [
              { label: 'Yes, and it is ON', ok: true },
              { label: 'Greyed out / missing', ok: false, help: 'Needs an internet connection and sometimes 7 days of uptime after a factory reset. Also make sure no SIM PIN lock is active.' }
            ]
          }
        },
        {
          id: 'lock',
          title: 'Remove the screen lock and back up IMEI',
          items: [
            { t: 'text', v: 'Settings → Lock screen → Screen lock type → None.' },
            { t: 'text', v: 'Dial *#06# and write the IMEI(s) down — cheap insurance.' },
            { t: 'warn', v: 'A PIN/fingerprint left active is a common cause of failed flashes on J-series.' },
            { t: 'check', v: 'Screen lock set to None, IMEI noted.' }
          ]
        }
      ]
    },
    {
      id: 'unlock',
      title: 'Unlock bootloader',
      icon: '🔓',
      steps: [
        {
          id: 'enter-dl',
          title: 'Enter Download mode',
          items: [
            { t: 'text', v: 'Power the phone off completely.' },
            { t: 'text', v: 'Hold Vol Up + Vol Down together, then plug the USB cable into the PC.' },
            { t: 'text', v: 'A teal/orange warning screen appears → press Vol Up once to continue.' },
            { t: 'text', v: 'You should now see the Download mode screen.' },
            { t: 'check', v: 'Phone is in Download mode and Odin shows “Added!!”.' }
          ]
        },
        {
          id: 'unlock-bl',
          title: 'Unlock the bootloader (this wipes the phone)',
          lead: 'Do this from the Download-mode warning screen, not from the normal OS.',
          items: [
            { t: 'warn', v: 'This step ERASES EVERYTHING and trips Knox permanently.' },
            { t: 'text', v: 'Power off, re-enter Download mode (Vol Up + Vol Down + cable).' },
            { t: 'text', v: 'On the warning screen, press Vol Up — you get an “Unlock bootloader?” screen.' },
            { t: 'text', v: 'LONG-PRESS Volume Up to confirm. The phone wipes and reboots.' },
            { t: 'text', v: 'Complete the setup wizard, SKIP everything, but CONNECT TO Wi‑Fi during setup.' },
            { t: 'check', v: 'Phone booted, setup done, Wi‑Fi connected.' }
          ],
          verify: {
            q: 'After setup: does Developer options show OEM unlocking GREYED OUT (i.e. locked ON)?',
            options: [
              { label: 'Yes, greyed out = unlocked', ok: true },
              { label: 'No, it is toggleable again', ok: false, help: 'The bootloader re-locked (happens on some units). Re-check in Download mode: OEM LOCK must read OFF (U). If it reads ON (L), repeat the unlock — and keep Wi‑Fi connected.' },
              { label: 'I get "Only official released binaries..."', ok: false, help: 'KnoxGuard is Prenormal. Factory reset in stock recovery, then keep the phone online for 168 h of uptime, or flash RMM State Bypass v3 from recovery.' }
            ]
          }
        },
        {
          id: 'dl-status',
          title: 'Sanity-check Download mode',
          lead: 'Re-enter Download mode and read the lines on screen.',
          items: [
            { t: 'text', v: 'PRODUCT NAME should match your model (e.g. SM-J400F).' },
            { t: 'text', v: 'OEM LOCK: OFF (U)  ← required to flash anything custom.' },
            { t: 'text', v: 'KG: Checking / Completed / Broken  ← good. Prenormal = blocked (see troubleshooting).' },
            { t: 'text', v: 'KNOX WARRANTY VOID: 0x1 after flashing (expected).' },
            { t: 'check', v: 'OEM LOCK shows OFF (U).' }
          ],
          verify: {
            q: 'What does OEM LOCK say?',
            options: [
              { label: 'OFF (U)', ok: true },
              { label: 'ON (L)', ok: false, help: 'Bootloader is still locked. Go back to the previous step: OEM unlocking must be greyed ON before you enter Download mode.' },
              { label: 'No OEM LOCK line', ok: false, help: 'Region/carrier units sometimes hide it — those are not unlockable. Confirm your exact model before continuing.' }
            ]
          }
        }
      ]
    },
    {
      id: 'patch',
      title: 'Patch AP with Magisk',
      icon: '🩹',
      steps: [
        {
          id: 'copy-ap',
          title: 'Copy the AP file to the phone',
          items: [
            { t: 'text', v: 'From the extracted firmware folder, take ONLY the file starting with AP_ (it is the biggest, 1–2 GB).' },
            { t: 'text', v: 'Rename it to AP.tar if your Magisk build complains about the .md5 suffix.' },
            { t: 'text', v: 'Copy it to the phone: Download/ folder (USB cable or any file manager).' },
            { t: 'check', v: 'AP.tar sits in the phone’s Download folder.' }
          ]
        },
        {
          id: 'patch-ap',
          title: 'Patch the AP file inside Magisk',
          items: [
            { t: 'text', v: 'Open Magisk → tap Install (in the Magisk card).' },
            { t: 'text', v: 'Method → Select and Patch a File → choose AP.tar → Start.' },
            { t: 'text', v: 'Wait for “All done!” — output is saved as Download/magisk_patched_XXXX.tar (this can take a few minutes).' },
            { t: 'warn', v: 'If Magisk home shows “Ramdisk: No”, tick Recovery Mode before patching — and you will boot to recovery once after flashing to activate Magisk.' },
            { t: 'check', v: 'magisk_patched_*.tar exists in Download/' }
          ],
          verify: {
            q: 'Did patching finish without error?',
            options: [
              { label: 'Yes — “All done!”', ok: true },
              { label: 'Out of space / failed', ok: false, help: 'Free up ~3 GB internal storage (the AP tar is copied and rewritten). Also make sure you patched the AP from YOUR firmware build.' }
            ]
          }
        },
        {
          id: 'pull',
          title: 'Pull the patched file to the PC (never use MTP)',
          items: [
            { t: 'text', v: 'Connect the phone with USB debugging on, then in a terminal inside the platform-tools folder:' },
            { t: 'cmd', v: 'adb pull /sdcard/Download/magisk_patched_ .', hint: 'Tab-complete the full filename. On Windows: adb pull C:\\path — the file lands in the current folder.' },
            { t: 'warn', v: 'Do NOT drag the file in Windows Explorer (MTP) — it silently corrupts files over ~1 GB.' },
            { t: 'check', v: 'magisk_patched_*.tar is on the PC and larger than 1 GB.' }
          ],
          verify: {
            q: 'Is the pulled file roughly the same size as the original AP file?',
            options: [
              { label: 'Yes (within ~100 MB)', ok: true },
              { label: 'Much smaller', ok: false, help: 'Corrupt transfer (usually MTP). Delete it and re-run the adb pull command.' }
            ]
          }
        }
      ]
    },
    {
      id: 'flash',
      title: 'Flash with Odin',
      icon: '⚡',
      steps: [
        {
          id: 'odin-setup',
          title: 'Load the four slots',
          lead: 'Run Odin3 as Administrator. Phone must be in Download mode (Vol Up + Vol Down + cable → Vol Up).',
          items: [
            { t: 'text', v: 'BL slot → firmware BL_….tar.md5' },
            { t: 'text', v: 'AP slot → magisk_patched_XXXX.tar  ← the PATCHED file, never the stock AP' },
            { t: 'text', v: 'CP slot → firmware CP_….tar.md5' },
            { t: 'text', v: 'CSC slot → firmware CSC_….tar.md5 (NOT HOME_CSC — we need the wipe)' },
            { t: 'warn', v: 'Options tab → UNCHECK “Auto Reboot”. Leave F. Reset time checked.' },
            { t: 'check', v: 'Four slots filled, Auto Reboot unchecked, Odin says “Added!!”.' }
          ],
          verify: {
            q: 'Does Odin show the device on a COM port (“Added!!”)?',
            options: [
              { label: 'Yes', ok: true },
              { label: 'No', ok: false, help: 'Reinstall Samsung USB drivers, try another cable/port (USB 2.0 port, not a hub), and re-enter Download mode. On Linux use `heimdall detect` instead.' }
            ]
          }
        },
        {
          id: 'flash-run',
          title: 'Flash and factory-reset',
          lead: 'Do not unplug or touch the phone during the flash.',
          items: [
            { t: 'text', v: 'Click Start. Wait for a green PASS! box.' },
            { t: 'text', v: 'Phone stays in Download mode (because Auto Reboot is off).' },
            { t: 'text', v: 'Force recovery: hold Vol Down + Power ~7 s until the screen blanks, then IMMEDIATELY hold Vol Up + Power (cable still connected) until recovery appears.' },
            { t: 'text', v: 'In stock recovery: Wipe data/factory reset → Factory data reset → Reboot system now.' },
            { t: 'warn', v: 'First boot can take 5–10 minutes. If it is still on the logo after 15 minutes, see troubleshooting.' },
            { t: 'check', v: 'Phone booted into Android after the reset.' }
          ],
          verify: {
            q: 'What did Odin report?',
            options: [
              { label: 'PASS!', ok: true },
              { label: 'FAIL!', ok: false, help: 'Note the message: “MD5 checksum value is incorrect” → bad download; “Binary is blocked” → OEM LOCK not OFF; “Write protect” / “Only official released binaries” → KnoxGuard Prenormal. Re-flash stock firmware with CSC to recover, then retry.' }
            ]
          }
        }
      ]
    },
    {
      id: 'finish',
      title: 'Finish & verify',
      icon: '✅',
      steps: [
        {
          id: 'magisk-setup',
          title: 'Complete Magisk setup',
          items: [
            { t: 'text', v: 'Finish the setup wizard (Wi‑Fi on).' },
            { t: 'text', v: 'Install the Magisk APK again if only a stub icon is present.' },
            { t: 'text', v: 'Open Magisk → accept “Additional setup” → let it reboot the device automatically.' },
            { t: 'text', v: 'If you ticked Recovery Mode earlier: boot to recovery once (Vol Up + Power with cable connected) to activate Magisk, then reboot to system.' },
            { t: 'check', v: 'Magisk home screen shows “Installed” next to Magisk.' }
          ]
        },
        {
          id: 'verify',
          title: 'Verify root',
          items: [
            { t: 'cmd', v: 'adb shell su -c id', hint: 'Expected: uid=0(root) gid=0(root). A popup asking to grant root should appear on the phone.' },
            { t: 'text', v: 'Or install any root checker app from Play Store and tap Verify.' },
            { t: 'check', v: 'Root confirmed (uid=0).' }
          ],
          verify: {
            q: 'Did you get root?',
            options: [
              { label: 'Yes — uid=0', ok: true },
              { label: 'No / no su popup', ok: false, help: 'Open Magisk → check Magisk “Installed”. If it says NOT installed, re-flash magisk_patched AP with CSC. If Magisk is installed but su is denied, check Superuser settings inside the Magisk app.' }
            ]
          }
        }
      ]
    },
    {
      id: 'aftercare',
      title: 'Live with root',
      icon: '🛡️',
      steps: [
        {
          id: 'rules',
          title: 'Rules that keep your root (and your phone) alive',
          items: [
            { t: 'warn', v: 'Never flash a stock AP file over Magisk — you will lose root or bootloop.' },
            { t: 'warn', v: 'Never restore boot/recovery/vbmeta to stock individually.' },
            { t: 'text', v: 'To update Android: download the new firmware → patch its AP in Magisk → in Odin use HOME_CSC instead of CSC (upgrade without wiping).' },
            { t: 'text', v: 'OTA updates will no longer work cleanly — always go through the patch cycle above.' },
            { t: 'text', v: 'Keep the stock firmware zip for your build somewhere safe — it is your unbrick path.' },
            { t: 'text', v: 'Play Integrity will fail (unlocked bootloader + old device). Zygisk + DenyList in Magisk helps some apps, but nothing is guaranteed on Android 10.' },
            { t: 'text', v: 'KernelSU / APatch are NOT available for this phone (32-bit CPU).' },
            { t: 'check', v: 'I have read the update and recovery rules.' }
          ]
        }
      ]
    }
  ],
  troubleshoot: [
    {
      id: 'kg',
      title: '“Only official released binaries are allowed to be flashed”',
      body: 'KnoxGuard is Prenormal. Fix: factory reset from stock recovery; if it persists, boot TWRP and flash RMM State Bypass v3, then keep the phone powered on and connected for 168 hours of uptime. Check state in Download mode: Prenormal = waiting, Checking/Completed/Broken = clear.'
    },
    {
      id: 'bootloop',
      title: 'Stuck on the Samsung logo after flashing',
      body: 'Enter Download mode (Vol Up + Vol Down + cable), flash the stock firmware with the CSC file to return to a clean state, factory reset, then retry with a patched AP built from that exact firmware. Also confirm you did not flash the stock AP instead of magisk_patched.'
    },
    {
      id: 'odin-fail',
      title: 'Odin reports FAIL or hangs',
      body: 'Common causes: wrong model firmware, corrupt download (re-check the md5), Auto Reboot left on with a bad file, bad USB cable/port (use a rear USB 2.0 port), or LZ4-compressed firmware with an old Odin (use Odin 3.13.1+). On Linux prefer Odin4 for Linux; with Heimdall remember it flashes partitions, not AP slots.'
    },
    {
      id: 'no-oem',
      title: 'OEM unlocking toggle missing or active again',
      body: 'Samsung delays OEM unlock for up to 7 days after a factory reset on some units. Connect to Wi‑Fi, reboot a few times, keep the phone used and online. If Download mode shows no OEM LOCK line at all, your unit is region-locked and not unlockable.'
    },
    {
      id: 'root-lost',
      title: 'Root disappeared after a reboot or update',
      body: 'Check Magisk app: if “Installed” is empty, re-flash magisk_patched AP (use HOME_CSC if you are just repairing). Never accept an OTA blindly on a rooted phone.'
    },
    {
      id: 'banking',
      title: 'Banking app refuses to run',
      body: 'Expected on an unlocked bootloader. In Magisk enable Zygisk, add the app to DenyList, and force-stop it. Some apps (Google Wallet especially) will still refuse — hardware attestation cannot be spoofed on this device.'
    }
  ]
}

export const GUIDES = { j4: J4_GUIDE }
