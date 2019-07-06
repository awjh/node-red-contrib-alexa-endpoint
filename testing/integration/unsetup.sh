#!/bin/bash

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

kill -9 $(lsof -i :1880 | grep 'node' | awk '{print $2}')
kill -9 $(pidof node-red) # test on mac

NODE_FOLDER=$BASEDIR/../..
NODE_RED=$HOME/.node-red
HOSTNAME_SHORT=`hostname -s`

rm -f $BASEDIR/.flow.json.backup
rm -f $BASEDIR/.flow.json.json

cd "$NODE_RED"
npm uninstall "$NODE_FOLDER"