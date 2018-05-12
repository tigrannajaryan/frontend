# Introduction
MadeBeauty mobile apps.

# Directory Structure

The repository has the following structure:
```
/mobile    - mobile apps
  /client  - Client app (To be created)
  /stylist - Stylist app
  /shared  - shared code for mobile apps
```

# Building

To build mobile apps using parallel build do this in `mobile` directory: `make -j8`.
If running nder Windows install GnuWin32 and use this command `make -j8 "MAKE=make -j8"`

To clean use `make clean`.