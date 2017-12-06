# Display Control Module [![Circle CI](https://circleci.com/gh/Rise-Vision/display-control-module.svg?style=svg)](https://circleci.com/gh/Rise-Vision/display-control-module)

## Introduction
The Display Control Module executes screen commands such as turning a screen on and off.

## Development

### Local Development Environment Setup and Installation

*  Clone repository:
```bash
git clone https://github.com/Rise-Vision/display-control-module.git
```

*  Install:
```bash
npm install
```

* Build:
```bash
npm run build
```

* Test:
```bash
npm run test
```

### Manual testing

Clone local-messaging-module, install and run it:

```bash
git clone https://github.com/Rise-Vision/local-messaging-module.git
npm install
node src/index.js
```

Do the same for logging-module in a different terminal window:

```bash
git clone https://github.com/Rise-Vision/logging-module.git
npm install
node src/index.js
```

Do the same for local-storage in a different terminal window:

```bash
git clone https://github.com/Rise-Vision/local-storage.git
npm install
node src/index.js
```

Then, supposing display-control-module is already installed, open another
terminal window and run it:

```bash
node src/index.js
```

You should see a WATCH event sent and caught by local-storage, and an
FILE-UPDATE status response coming shortly after that.

### Manually testing send command events to BQ via logging module

Instead of running the main src/index.js script, run files from manual
subdirectory:

```bash
node manual/send_command.js
```

This needs local-messaging-module and logging-module to be also running.

### Manually testing CEC commands on Raspbian PI

#### Install cec-utils

In order for CEC commands to run, cec-utils must be installed in the
PI computer:

```bash
sudo apt install cec-utils
```

Once installed, we can check the status of the CEC adapter using:

```bash
cec-client -l
```

This should return something like the following in a successful install:

```
libCEC version: 4.0.2, git revision: libcec-4.0.2+30-8adc786~dirty, compiled on Mon Aug 21 09:41:41 UTC 2017 by root@hostname: Name or service not known on Linux 4.4.0-92-generic (armv7l), features: P8_USB, DRM, P8_detect, randr, RPi
Found devices: 1

device:              1
com port:            RPI
vendor id:           2708
product id:          1001
firmware version:    1
type:                Raspberry Pi
```

And would send something like this if current devices and/or HDMI cables do
not support CEC:

```
libCEC version: 3.0.1, compiled on Linux-3.13.0-77-generic ... , features: P8_USB, P8_detect, randr
Found devices: NONE
```

#### List CEC-enabled devices

If there are devices, we can now list them using a command like this one:

```bash
echo scan | cec-client -s -d 1
```

Where:
- '-s' means command execution and exit, no interactive mode.
- '-d 1' means debug mode enabled, useful for tests

If there are connected devices supporting CEC, this will return something like:

```
opening a connection to the CEC adapter...
requesting CEC bus information ...
CEC bus information
===================
device #0: TV
address:       0.0.0.0
active source: yes
vendor:        Samsung
osd string:    TV
CEC version:   1.3a
power status:  on
language:      eng


device #1: Recorder 1
address:       1.0.0.0
active source: no
vendor:        Pulse Eight
osd string:    CECTester
CEC version:   1.4
power status:  on
language:      eng


currently active source: TV (0)
```

Note that the monitor ( TV ) is listed as address 0; this is the address
CEC uses for monitors and thus is the used in this module's code.

The 'power status' entry is the one that will be affected by the commands
of display-control-module. Note that in this case the monitor/TV power status
is on.

See cec-client documentation for more information about this utility.

#### Test connection to the CEC Adapter

Now we can test connection to CEC adapter using the following
simple script:

```bash
node manual/cec/connect.js
```

If this invocation fails, all of the rest of CEC tests will fail, and the
CEC facilities of display-control-module will also fail in this computer.

#### Turn off the screen

Then we can tell the CEC monitor to turn off:

```bash
node manual/cec/turn_off.js
```

If the previous command succeeds and a scan is performed now, the Power Status
for the TV device should be 'standby'.

The way to perform this same command using cec-client is:

```bash
echo "standby 0" | cec-client -s -d 1
```

In this command '0' refers to the monitor/TV device mentioned before.
