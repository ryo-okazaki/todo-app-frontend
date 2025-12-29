#!/bin/sh

npm install

if [ "$NEXT_SERVER_DEBUG" = "1" ]; then
  npm run dev:debug
else
  npm run dev
fi
