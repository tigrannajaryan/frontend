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
robocopy "$1" "$2" /MIR /NJH /NJS /NDL /NFL >nul || rem
endef
else
define COPYDIR
cp -Rf $1 $2
endef
endif


# Define RMDIR command
ifeq ($(OS),Windows_NT)
define RMDIR
rmdir /Q /S "$1" > nul 2>&1 || rem
endef
else
define RMDIR
rm -rf $1 || echo
# || echo
endef
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
	$(call SYMLINK,..$(PATHSEP)..$(PATHSEP)..$(PATHSEP)shared$(PATHSEP)code,$@)

$(INSTALLDIR)/e2e/shared:
	$(call SYMLINK,..$(PATHSEP)..$(PATHSEP)shared$(PATHSEP)e2e,$@)


preinstall-dir: $(INSTALLDIR)/src/app/shared $(INSTALLDIR)/e2e/shared
	$(L)echo Installing $(INSTALLDIR) prerequisites...
	$(L)cd $(INSTALLDIR) && npm i --silent --no-save
	$(L)echo Installed $(INSTALLDIR) prerequisites.

preinstall-assets:
	$(L)echo Copying $(INSTALLDIR) assets...
	$(call RMDIR $(INSTALLDIR)/src/assets)
	$(call COPYDIR,shared/assets,$(INSTALLDIR)/src/assets)
	$(L)echo Copied $(INSTALLDIR) assets.


build-apps: build-client build-stylist


preinstall-client:
	$(SMAKE) preinstall-assets INSTALLDIR=client
	$(SMAKE) preinstall-dir INSTALLDIR=client

preinstall-stylist:
	$(SMAKE) preinstall-assets INSTALLDIR=stylist
	$(SMAKE) preinstall-dir INSTALLDIR=stylist


# Build the app in the $(BUILDDIR)
npm-build-dir:
	$(L)echo Building $(BUILDDIR)...
	$(L)cd $(BUILDDIR) && npm run build --silent
	$(L)echo Build $(BUILDDIR) finished.

# Build the app in the $(BUILDDIR) using fast build
npm-build-fast-dir:
	$(L)echo Fast building $(BUILDDIR)...
	$(L)cd $(BUILDDIR) && npm run build-fast --silent
	$(L)echo Fast build $(BUILDDIR) finished.

# Build the app in the $(BUILDDIR) and run all tests on it
npm-build-and-test-dir: npm-build-dir
	$(SMAKE) npm-test-dir

# Full build and all tests of client
build-client: preinstall-client
	$(SMAKE) npm-build-and-test-dir BUILDDIR=client

# Full build and all tests of stylist
build-stylist: preinstall-stylist
	$(SMAKE) npm-build-and-test-dir BUILDDIR=stylist

# Build without running tests of client
build-fast-client: preinstall-client
	$(SMAKE) npm-build-fast-dir BUILDDIR=client

# Build without running tests of stylist
build-fast-stylist: preinstall-stylist
	$(SMAKE) npm-build-fast-dir BUILDDIR=stylist

build-and-e2etest-client: build-fast-client
	$(SMAKE) npm-test-dir-e2e BUILDDIR=client

build-and-e2etest-stylist: build-fast-stylist
	$(SMAKE) npm-test-dir-e2e BUILDDIR=stylist


npm-test-dir: npm-test-dir-unit npm-test-dir-e2e

npm-test-dir-unit:
	$(L)echo Unit testing $(BUILDDIR)...
	$(L)cd $(BUILDDIR) && ../scripts/run_test.sh
	$(L)echo Unit testing $(BUILDDIR) finished.

npm-test-dir-e2e:
	$(L)echo E2E testing $(BUILDDIR)...
	$(L)$(BUILDDIR)$(PATHSEP)e2e$(PATHSEP)shared$(PATHSEP)rune2e
	$(L)echo E2E testing $(BUILDDIR) finished.


clean: clean-client clean-stylist

clean-client:
	$(SMAKE) clean-dir BUILDDIR=client

clean-stylist:
	$(SMAKE) clean-dir BUILDDIR=stylist

clean-dir:
	$(call RMDIR,$(BUILDDIR)/node_modules)
	$(call RMDIR,$(BUILDDIR)/src/assets)
	$(call RMDIR,$(BUILDDIR)/www)
	$(call RMDIR,$(BUILDDIR)/platforms)
	$(call RMDIR,$(BUILDDIR)/plugins)
	$(call RMDIR,$(BUILDDIR)/.sourcemaps)
	$(call RMDIR,$(BUILDDIR)/TESTS.xml)
	@echo Cleaning $(BUILDDIR) done.

