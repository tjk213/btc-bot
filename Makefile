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

GSCC := $(TOP)/tools/gscc.py # custom google-scriptlet compiler
CSSI := python -mpremailer   # CSS-Inliner

##
## Compilation Flags
##

## Disable CSS validation during inlining. Currently, this complains about 'ch'
## units in CSS even though it doesn't seem to cause any problems. We're disabling
## merely to suppress the noise on the console.
IFLAGS += --disable-validation

##
## Source directories
##

VPATH := src

##
## Targets
##

HTML_TMP = Email.inlined.ct.html
HTML_TGT = Email.inlined.gt.html

all: $(HTML_TGT)

.PHONY: all clean
.PRECIOUS: %.inlined.ct.html

##
## Recipes
##

%.inlined.ct.html: %.ct.html
	$(CSSI) $(IFLAGS) -o $@ -f $<

# GSCC processes comment-templated HTML and produces google-templated HTML.
# That is, comments like <!--PS: ... --> are replaced with google scriptlets
# like <?= ... ?>. We use .ct.html and .gt.html, respectively, as file
# extensions for these types.
%.gt.html: %.ct.html
	$(GSCC) -o $@ $<

clean:
	@rm -f $(HTML_TGT) $(HTML_TMP)
