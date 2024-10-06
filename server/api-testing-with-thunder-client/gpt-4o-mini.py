import http.client
import json

conn = http.client.HTTPSConnection("127.0.0.1", 8000)

headersList = {
    "Accept": "*/*",
    "User-Agent": "Thunder Client (https://www.thunderclient.com)",
    "Content-Type": "application/json",
}

payload = json.dumps(
    {"prompt": "What is life?", "model": "gpt-4o-mini", "temperature": "0.2"}
)

conn.request("GET", "/", payload, headersList)
response = conn.getresponse()
result = response.read()

print(result.decode("utf-8"))
