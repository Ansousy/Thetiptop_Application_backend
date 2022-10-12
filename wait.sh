#!/bin/sh

while ! nc -z database 3306 ;
do
    echo "Waiting for the MySQL Server"
    sleep 6;
done

node server.js
