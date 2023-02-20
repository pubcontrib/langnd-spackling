#!/bin/sh

# check-valgrind: utility for running the tests of langnd through Valgrind to
# search for memory violations and leaks

# Remember the starting work directory to save non-standard test results to
start=`pwd`
project="$HOME/repos/sourcehut/langnd"

# Goto project directory and rebuild binary with more debug info
cd "$project"
make clean
make CFLAGS='-ansi -pedantic -Wall -Werror -Wextra -g'

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
sh run.sh 'valgrind --leak-check=full --error-exitcode=64 -q --log-file=valgrind-log.txt ../bin/langnd'

if [ -f valgrind-log.txt -a -s valgrind-log.txt ]
then
    status='LEAK'
    text='memory test failed'
    color=33

    if [ -z "$NO_COLOR" ]
    then
        printf '\033[7;%dm %s \033[0m\n%s\n' $color "$status" "$text" 1>&2
    else
        printf '[%s]\n%s\n' "$status" "$text" 1>&2
    fi

    header='Log'

    if [ -z "$NO_COLOR" ]
    then
        printf '\033[1m%s:\033[0m\n' "$header" 1>&2
    else
        printf '%s:\n' "$header" 1>&2
    fi

    cat valgrind-log.txt 1>&2
fi

rm valgrind-log.txt

# Safely clean debug build
cd "$project"
make clean
