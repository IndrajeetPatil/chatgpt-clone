#!/bin/bash
# valid
curl -X 'POST' \
  'http://localhost:8000/api/v1/chat' \
  -H 'accept: text/plain' \
  -H 'Content-Type: application/json' \
  -d '{
  "messages": [{"role": "user", "parts": [{"type": "text", "text": "what is AI?"}]}],
  "model": "gpt-4o",
  "temperature": "BALANCED"
}'

# invalid: wrong model name
curl -X 'POST' \
  'http://localhost:8000/api/v1/chat' \
  -H 'accept: text/plain' \
  -H 'Content-Type: application/json' \
  -d '{
  "messages": [{"role": "user", "parts": [{"type": "text", "text": "what is AI?"}]}],
  "model": "gpt-bla",
  "temperature": "BALANCED"
}'

# invalid: wrong temperature
curl -X 'POST' \
  'http://localhost:8000/api/v1/chat' \
  -H 'accept: text/plain' \
  -H 'Content-Type: application/json' \
  -d '{
  "messages": [{"role": "user", "parts": [{"type": "text", "text": "what is AI?"}]}],
  "model": "gpt-4o",
  "temperature": "HOT"
}'

# invalid: missing text message
curl -X 'POST' \
  'http://localhost:8000/api/v1/chat' \
  -H 'accept: text/plain' \
  -H 'Content-Type: application/json' \
  -d '{
  "messages": [{"role": "user", "parts": [{"type": "text", "text": ""}]}]
}'
