#!/bin/bash
# valid
curl -X 'POST' \
    'http://127.0.0.1:8000/api/v1/chat/gpt-4o/?temperature=balanced' \
    -H 'accept: application/json' \
    -H 'Content-Type: application/json' \
    -H 'X-CSRFTOKEN: 2m4lWrUeSyNpMX7tGw8wmaqWNUkI2xc0wQo7xaH2OfKmpZYUN27izfheYDceUSMw' \
    -d '{
  "prompt": "what is AI?"
}'

# invalid: wrong model name
curl -X 'POST' \
    'http://127.0.0.1:8000/api/v1/chat/gpt-bla/?temperature=balanced' \
    -H 'accept: application/json' \
    -H 'Content-Type: application/json' \
    -H 'X-CSRFTOKEN: 2m4lWrUeSyNpMX7tGw8wmaqWNUkI2xc0wQo7xaH2OfKmpZYUN27izfheYDceUSMw' \
    -d '{
  "prompt": "what is AI?"
}'

# invalid: wrong temperature
curl -X 'POST' \
    'http://127.0.0.1:8000/api/v1/chat/gpt-4o/?temperature=hot' \
    -H 'accept: application/json' \
    -H 'Content-Type: application/json' \
    -H 'X-CSRFTOKEN: 2m4lWrUeSyNpMX7tGw8wmaqWNUkI2xc0wQo7xaH2OfKmpZYUN27izfheYDceUSMw' \
    -d '{
  "prompt": "what is AI?"
}'

# invalid: missing prompt
curl -X 'POST' \
    'http://127.0.0.1:8000/api/v1/chat/gpt-4o/?temperature=balanced' \
    -H 'accept: application/json' \
    -H 'Content-Type: application/json' \
    -H 'X-CSRFTOKEN: 2m4lWrUeSyNpMX7tGw8wmaqWNUkI2xc0wQo7xaH2OfKmpZYUN27izfheYDceUSMw' \
    -d '{
  "prompt": ""
}'
