#!/bin/bash
echo '
{
        "prompt": "Write one Haskell function to create Fibonacci sequence?",
        "model": "gpt-4o",
        "temperature": "0.9"
}

' |
    http POST http://127.0.0.1:8000/ \
        Accept:'*/*' \
        Content-Type:application/json \
        User-Agent:'Thunder Client (https://www.thunderclient.com)'
