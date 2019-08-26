from flask import Flask
from flask_cors import CORS
from flask import request
import os
# from push import *
from db import *
app = Flask(__name__)
CORS(app)

@app.route('/push')
def execute_push():
    location = request.args.get("location")
    print("location : ", location)
    if location == None:
        return ""
    os.chdir(location)
    return os.popen("python3 push.py").read()

@app.route('/getDifference')
def getDifference():
   return returnDifference(int(request.args.get('len')))


@app.route('/hash')
def commitHash():
   commitsHash = ""
   for eachHash in range(len(Commits)):
      print(Commits[eachHash].hash)
      commitsHash = commitsHash + str(Commits[eachHash].hash)
      if eachHash != (len(Commits) - 1):
         commitsHash = commitsHash + ","
   return commitsHash

@app.route('/addedFiles')
def getAddedFiles():
   commitsAddedFiles = ""
   for i in range(len(Commits)):
      for j in range(len(Commits[i].Changes.addFiles)):
         for z in range(len(Commits[i].Changes.addFiles[j])):
            commitsAddedFiles += Commits[i].Changes.addFiles[j][z]
            commitsAddedFiles += ","
         commitsAddedFiles += "@@@"

   return commitsAddedFiles

@app.route('/removedFiles')
def getRemovedFiles():
   commitsRemovedFiles = ""
   for i in range(len(Commits)):
      for j in range(len(Commits[i].Changes.removeFiles)):
         for z in range(len(Commits[i].Changes.removeFiles[j])):
            commitsRemovedFiles += Commits[i].Changes.removeFiles[j][z]
            commitsRemovedFiles += ","
         commitsRemovedFiles += "@@@"

   return commitsRemovedFiles

@app.route('/addedLines')
def getAddedLines():
   commitsAddedLines = ""
   for i in range(len(Commits)):
      for j in range(len(Commits[i].Changes.addLines)):
         commitsAddedLines += str(Commits[i].Changes.addLines[j])
      commitsAddedLines += "$$$"
   return commitsAddedLines

@app.route('/removedLines')
def getRemovedLines():
   commitsRemovedLines = ""
   for i in range(len(Commits)):
      for j in range(len(Commits[i].Changes.removLines)):
         commitsRemovedLines += str(Commits[i].Changes.removLines[j])
      commitsRemovedLines += "$$$"
   return commitsRemovedLines

if __name__ == '__main__':
   app.run(debug = True)
