import http.client
import json

conn = http.client.HTTPSConnection("127.0.0.1", 8000)

headersList = {
    "Accept": "*/*",
    "User-Agent": "Thunder Client (https://www.thunderclient.com)",
    "Content-Type": "application/json",
}

payload = json.dumps(
    {
        "prompt": "Write one Haskell function to create Fibonacci sequence?",
        "model": "gpt-4o",
        "temperature": "0.9",
    }
)

conn.request("POST", "/", payload, headersList)
response = conn.getresponse()
result = response.read()

print(result.decode("utf-8"))
