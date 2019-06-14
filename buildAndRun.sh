#!/bin/sh

kill -9 $(lsof -i :1880 | grep 'node' | awk '{print $2}')
kill -9 $(pidof node-red) # test on mac
npm run build
node-red &
sleep 3s

if [ $(hostname) = "andydesktop" ]; then
    xdotool search --onlyvisible --class firefox mousemove 2060 50 click 1 mousemove restore
fi

xdotool search --onlyvisible --class firefox windowfocus key F5 Return # will only refresh open tab :( xdotool ctrl doesn't work so can't cycle through tabs
