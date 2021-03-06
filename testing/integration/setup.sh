#!/bin/bash

set -e

BASEDIR=$(dirname "$0")

if [ $BASEDIR = '.' ]
then
    BASEDIR=$(pwd)
elif [ ${BASEDIR:0:2} = './' ]
then
    BASEDIR=$(pwd)${BASEDIR:1}
elif [ ${BASEDIR:0:1} = '/' ]
then
    BASEDIR=${BASEDIR}
else
    BASEDIR/${BASEDIR}
fi

NODE_FOLDER=$BASEDIR/../..
NODE_RED=$HOME/.node-red
HOSTNAME_SHORT=`hostname -s`

cd "$NODE_FOLDER"
npm install
npm run build

if [ ! -d "$NODE_RED" ]; then
    node-red &
    sleep 5s
    kill -9 $(lsof -i :1880 | grep 'node' | awk '{print $2}')
    kill -9 $(pidof node-red) # test on mac
fi

cd "$NODE_RED"
npm install "$NODE_FOLDER"

set +e

kill -9 $(lsof -i :1880 | grep 'node' | awk '{print $2}')
kill -9 $(pidof node-red) # test on mac

set -e

node-red "$BASEDIR/flow.json" &
sleep 5s