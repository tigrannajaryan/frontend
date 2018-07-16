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
	$(call SYMLINK,..$(PATHSEP)..$(PATHSEP)..$(PATHSEP)shared,$@)

preinstall-dir: $(INSTALLDIR)/src/app/shared
	$(L)echo Installing $(INSTALLDIR) prerequisites...
	$(L)cd $(INSTALLDIR) && npm i --silent --no-save
	$(L)echo Installed $(INSTALLDIR) prerequisites.


build-apps: build-client build-stylist


preinstall-client:
	$(SMAKE) preinstall-dir INSTALLDIR=client

preinstall-stylist:
	$(SMAKE) preinstall-dir INSTALLDIR=stylist


npm-build-dir:
	$(L)echo Building $(BUILDDIR)...
	$(L)cd $(BUILDDIR) && npm run build-full --silent
	$(L)echo Build $(BUILDDIR) finished.

build-client: preinstall-client
	$(SMAKE) npm-build-dir BUILDDIR=client


build-stylist: preinstall-stylist
	$(SMAKE) npm-build-dir BUILDDIR=stylist


clean: clean-client clean-stylist


clean-client:
	cd client		&& \
	$(RMDIR) node_modules www platforms plugins .sourcemaps TESTS.xml || echo

clean-stylist:
	cd stylist		&& \
	$(RMDIR) node_modules www platforms plugins .sourcemaps TESTS.xml || echo
