.PHONY: all

all: build-apps


.PHONY: preinstall-dir preinstall-shared build-apps build-dir build-client build-stylist
.PHONY: clean clean-shared clean-client clean-stylist

# Define path separator symbol and

ifeq ($(OS),Windows_NT)
PATHSEP2=\\
else
PATHSEP2=/
endif

PATHSEP=$(strip $(PATHSEP2))

# Define SYMLINK command

ifeq ($(OS),Windows_NT)
define SYMLINK
mklink /D "$2" "$1" || (echo ERROR: Cannot create symbolink link $2. Run make as Administrator ^(required one time only^). && exit 1)
endef
else
define SYMLINK
ln -s $1 $2
endef
endif


# Define COPYDIR command
ifeq ($(OS),Windows_NT)
define COPYDIR
robocopy "$1" "$2" /MIR
endef
else
define COPYDIR
cp -Rf $1 $2
endef
endif


# Define RM command
ifeq ($(OS),Windows_NT)
RMDIR=rmdir /Q /S
else
RMDIR=rm -rf
endif

# See if logging is enabled. To enable logging call make with LOG=yes parameter
ifeq "$(LOG)" "yes"
	L=
	SMAKE:=+$(MAKE)
else
	L=@
	SMAKE:=+@$(MAKE) -s
endif


$(INSTALLDIR)/src/app/shared:
	$(call SYMLINK,..$(PATHSEP)..$(PATHSEP)..$(PATHSEP)shared/code,$@)

$(INSTALLDIR)/e2e/shared:
	$(call SYMLINK,..$(PATHSEP)..$(PATHSEP)shared/e2e,$@)


preinstall-dir: $(INSTALLDIR)/src/app/shared $(INSTALLDIR)/e2e/shared
	$(L)echo Installing $(INSTALLDIR) prerequisites...
	$(L)cd $(INSTALLDIR) && npm i --silent --no-save
	$(L)echo Installed $(INSTALLDIR) prerequisites.

preinstall-assets:
	$(L)echo Installing $(INSTALLDIR) assets prerequisites...
	$(L) $(RMDIR) $(INSTALLDIR)/src/assets
	$(call COPYDIR,shared/assets,$(INSTALLDIR)/src/assets)
	$(L)echo Installed $(INSTALLDIR) assets prerequisites.


build-apps: build-client build-stylist


preinstall-client:
	$(SMAKE) preinstall-assets INSTALLDIR=client
	$(SMAKE) preinstall-dir INSTALLDIR=client

preinstall-stylist:
	$(SMAKE) preinstall-assets INSTALLDIR=stylist
	$(SMAKE) preinstall-dir INSTALLDIR=stylist


npm-build-dir:
	$(L)echo Building $(BUILDDIR)...
	$(L)cd $(BUILDDIR) && npm run build --silent
	$(L)echo Build $(BUILDDIR) finished.
	$(SMAKE) npm-test-dir

build-client: preinstall-client
	$(SMAKE) npm-build-dir BUILDDIR=client


build-stylist: preinstall-stylist
	$(SMAKE) npm-build-dir BUILDDIR=stylist

npm-test-dir: npm-test-dir-unit npm-test-dir-e2e

npm-test-dir-unit:
	$(L)echo Unit testing $(BUILDDIR)...
	$(L)cd $(BUILDDIR) && npm run test-headless --silent
	$(L)echo Unit testing $(BUILDDIR) finished.

npm-test-dir-e2e:
	$(L)echo E2E testing $(BUILDDIR)...
	$(L)cd $(BUILDDIR) && npm run e2e-test --silent
	$(L)echo E2E testing $(BUILDDIR) finished.


clean: clean-client clean-stylist


clean-client:
	cd client		&& \
	$(RMDIR) node_modules www platforms plugins .sourcemaps TESTS.xml || echo

clean-stylist:
	cd stylist		&& \
	$(RMDIR) node_modules www platforms plugins .sourcemaps TESTS.xml || echo
