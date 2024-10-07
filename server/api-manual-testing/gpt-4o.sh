#!/bin/bash
echo '
{
        "prompt": "Write a dad joke",
        "model": "gpt-4o-mini",
        "temperature": "0.9"
}

' |
    http POST http://localhost:8000/ \
        Accept:'*/*' \
        Content-Type:application/json \
        User-Agent:'Thunder Client (https://www.thunderclient.com)'
