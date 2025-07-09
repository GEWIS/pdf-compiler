#!/bin/sh
set -e
# required for effective use of the sidecar texlive container
mktexlsr
exec ./pdf-compiler
