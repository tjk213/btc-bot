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

TOP := $(patsubst %/, %, $(dir $(lastword $(MAKEFILE_LIST))))

##
## Toolchains
##

GSCC := $(TOP)/tools/gscc.py

##
## Source directories
##

VPATH := src

##
## Targets
##

HTML_TARGET = Email.gt.html
all: $(HTML_TARGET)

.PHONY: all clean

##
## Recipes
##

# GSCC processes comment-templated HTML and produces google-templated HTML.
# That is, comments like <!--PS: ... --> are replaced with google scriptlets
# like <?= ... ?>. We use .ct.html and .gt.html, respectively, as file
# extensions for these types.
%.gt.html: %.ct.html
	$(GSCC) -o $@ $<

clean:
	@rm -f $(HTML_TARGET)
