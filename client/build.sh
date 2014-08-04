#!/bin/bash

rm -rf node_modules/;
npm install || exit 1;
export NODE_ENV="production";
grunt build || exit 2;
