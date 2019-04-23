#!/bin/sh

kill -9 $(lsof -i :1880 | grep 'node' | awk '{print $2}')
npm run build
node-red &