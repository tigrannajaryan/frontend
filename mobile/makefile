.PHONY: all

all: build-apps


.PHONY: preinstall-dir preinstall-shared build-apps build-dir build-client build-stylist
.PHONY: clean clean-shared clean-client clean-stylist

preinstall-dir:
	@echo Installing $(INSTALLDIR) prerequisites...
	@cd $(INSTALLDIR) && npm i --silent
	@echo Installed $(INSTALLDIR) prerequisites.


preinstall-shared:
	@$(MAKE) -s preinstall-dir INSTALLDIR=shared


build-apps: build-client build-stylist


preinstall-client:
	@$(MAKE) -s preinstall-dir INSTALLDIR=client

preinstall-stylist:
	@$(MAKE) -s preinstall-dir INSTALLDIR=stylist


npm-build-dir:
	@echo Building $(BUILDDIR)...
	@cd $(BUILDDIR) && npm run build-full --silent
	@echo Build $(BUILDDIR) finished.

build-client: preinstall-shared preinstall-client
	@$(MAKE) -s npm-build-dir BUILDDIR=client


build-stylist: preinstall-shared preinstall-stylist
	@$(MAKE) -s npm-build-dir BUILDDIR=stylist


clean: clean-shared clean-client clean-stylist


clean-shared:
	cd shared		&& \
	rm -rf node_modules

clean-client:
	cd client		&& \
	rm -rf node_modules www platforms plugins .sourcemaps TESTS.xml

clean-stylist:
	cd stylist		&& \
	rm -rf node_modules www platforms plugins .sourcemaps TESTS.xml
