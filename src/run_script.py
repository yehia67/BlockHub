import os
import requests
import sys

os.environ['NO_PROXY'] = '127.0.0.1'
location = sys.argv[1]
print("location : ", location)
r = requests.get('http://127.0.0.1:5000/push?location=' + location)
print(r.content)
