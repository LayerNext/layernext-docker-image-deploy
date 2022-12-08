#!/bin/bash

export $(grep -v '^#' .env | xargs -d '\n')

echo $SETUP_CUSTOMER
echo test
echo $Var2