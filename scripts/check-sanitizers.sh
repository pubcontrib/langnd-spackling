#!/bin/sh

# check-santiziers: utility for running the tests of langnd through Clang
# sanitizers to search for memory errors and undefined behavior

# Remember the starting work directory to save non-standard test results to
start=`pwd`
project="$HOME/repos/sourcehut/langnd"

# Goto project directory and rebuild binary with more debug info
cd "$project"
make clean
make CFLAGS='-ansi -pedantic -Wall -Werror -Wextra -O1 -g -fsanitize=address -fsanitize=undefined' LDFLAGS='-fsanitize=address'

if [ $? -ne 0 ]
then
    exit 1
fi

# Setup fail safe to clean debug build if the program quits early
failearly()
{
    rm valgrind-log.txt

    cd "$project"
    make clean
    exit 1
}

trap failearly INT QUIT ABRT

# Goto test directory and run test suite on the debug build wrapped in memory
# tests
cd test
sh run.sh ../bin/langnd

# Safely clean debug build
cd "$project"
make clean
