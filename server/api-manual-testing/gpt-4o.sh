#!/bin/bash
echo '
{
        "prompt": "Tell a random English saying",
        "model": "gpt-4o",
        "temperature": "0.2"
}

' |
    http POST http://localhost:8000/ \
        Accept:'*/*' \
        Content-Type:application/json \
        User-Agent:'Thunder Client (https://www.thunderclient.com)'
