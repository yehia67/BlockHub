from flask import Flask
from flask_cors import CORS
from push import *
app = Flask(__name__)
CORS(app)

@app.route('/')
def hello_world():
   return Commits[1].author

@app.route('/commit')
def commitHash():
   commitsHash = ""
   for eachHash in range(len(Commits)):
      print(Commits[eachHash].hash)
      commitsHash = commitsHash + str(Commits[eachHash].hash)
      if eachHash != (len(Commits) - 1):
         commitsHash = commitsHash + ","
   return commitsHash

if __name__ == '__main__':
   app.run(debug = True)
