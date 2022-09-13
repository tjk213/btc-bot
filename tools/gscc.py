#!/usr/bin/env python3
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

## GSCC: Google-Scripts Compiler Collection ©

import os

from argparse import ArgumentParser
from argparse import RawTextHelpFormatter

DESCRIPTION = 'Parse HTML and replace placeholder comments with google scriptlet tags.'

##
## This script replaces custom HTML comments with corresponding google scriptlet tags:
##
##         Standard-scriptlet: <!--SS: ... --> becomes <? ... ?>
##         Printing-scriptlet: <!--PS: ... --> becomes <?= ... ?>
##   Force-printing-scriptlet: <!--FPS:... --> becomes <?!= ... ?>
##
## See https://developers.google.com/apps-script/guides/html/templates for more info
## on google-apps HTML scriptlets.
##

HCT = '-->' # HTML Comment Terminator
GST = '?>'  # Google Scriptlet Terminator

def replaceTag(line:str, placeholder:str = '<!--SS:', tag:str = '<?'):
    '''
    For each occurrence of <placeholder> in <line>:

      - Verify that there is a matching '-->' terminator
      - Replace <placeholder> with <tag>
      - Replace the terminator with '?>'
    '''
    outline = line
    start_idx = line.find(placeholder)
    while start_idx != -1:
        end_idx = outline.find(HCT,start_idx)
        assert end_idx != -1,"Unterminated placeholder: multi-line comment?"
        outline = outline.replace(placeholder,tag,1)
        outline = outline.replace(HCT,GST,1)
        start_idx = outline.find(placeholder,end_idx)
    return outline

def main():
    # Define CLI
    parser = ArgumentParser(description=DESCRIPTION,
                            formatter_class=lambda prog: RawTextHelpFormatter(prog,max_help_position=60))
    parser.add_argument('infile',        type=str,metavar='<srcfile>',help='Read input from <srcfile>')
    parser.add_argument('--outfile','-o',type=str,metavar='<outfile>',help='Write output to <outfile>',required=True)

    # Parse args
    args = parser.parse_args()
    infile_name  = args.infile
    outfile_name = args.outfile

    # Check output dir exists
    output_dir = os.path.dirname(outfile_name) or '.'
    os.makedirs(output_dir,exist_ok=True)

    # Open files
    infile  = open(infile_name,'r')
    outfile = open(outfile_name,'w')

    # Process HTML line-by-line
    for line in infile:
        outline = replaceTag(line,'<!--SS:','<?')
        outline = replaceTag(outline,'<!--PS:','<?=')
        outline = replaceTag(outline,'<!--FPS:','<?!=')
        outfile.write(outline)

    # Cleanup & return
    infile.close()
    outfile.close()
    return

if __name__ == '__main__': main()
