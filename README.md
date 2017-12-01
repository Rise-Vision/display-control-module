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
