#!/bin/sh

cd /workdir/src && npm install

if [ "$NEXT_SERVER_DEBUG" = "1" ]; then
  cd /workdir/src && npm run dev:debug
else
  cd /workdir/src && npm run dev
fi
