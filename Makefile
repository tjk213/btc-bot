####################################################################################
##           _______  ________ ______         _______   ______  ________          ##
##          /       \/        /      \       /       \ /      \/        |         ##
##          $$$$$$$  $$$$$$$$/$$$$$$  |      $$$$$$$  /$$$$$$  $$$$$$$$/          ##
##          $$ |__$$ |  $$ | $$ |  $$/       $$ |__$$ $$ |  $$ |  $$ |            ##
##          $$    $$<   $$ | $$ |            $$    $$<$$ |  $$ |  $$ |            ##
##          $$$$$$$  |  $$ | $$ |   __       $$$$$$$  $$ |  $$ |  $$ |            ##
##          $$ |__$$ |  $$ | $$ \__/  |      $$ |__$$ $$ \__$$ |  $$ |            ##
##          $$    $$/   $$ | $$    $$/       $$    $$/$$    $$/   $$ |            ##
##          $$$$$$$/    $$/   $$$$$$/        $$$$$$$/  $$$$$$/    $$/             ##
##                                                                                ##
####################################################################################
##            Copyright © 2022 Tyler J. Kenney. All rights reserved.              ##
####################################################################################
####################################################################################

SUBDIRS = build

##
## Toolchains
##

CLASP = clasp

##
## Targets
##

all:   $(SUBDIRS)
push:  $(SUBDIRS)
clean: $(SUBDIRS)

.PHONY: all push clean $(SUBDIRS)

##
## Recipes
##

# Deploy results to google-scripts system via clasp.
# This just calls `clasp push`, but plumbing it through the makefile ensures we
# never forget to run `make` prior to pushing. Note that this will fail if the
# user has not yet authenticated through clasp.
push:
	@$(CLASP) push

$(SUBDIRS):
	$(MAKE) -C $@ $(MAKECMDGOALS)


