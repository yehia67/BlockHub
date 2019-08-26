from flask import Flask
from flask import Response
from flask_cors import CORS
from flask import request
import time
import os
from db import *
from filesData import *
app = Flask(__name__)


CORS(app)


def get_message():
    global commits
    '''this could be any function that blocks until data is ready'''
    time.sleep(1)
    if commits != '':
        return commits
    else:
        return "wait"   
    

def emptyCommits():
      global commits
      commits = '' 
@app.route('/push')
def execute_push():
    global commits 
    location = request.args.get("location")
    print("location : ", location)
    if location == None:
        return ""
    os.chdir(location)
    commits = os.popen("python3 push.py").read()
    return "done"

   


@app.route('/stream')
def stream():
   def eventStream():
        while True:
            # wait for source data to be available, then push it
            yield 'data: {}\n\n'.format(get_message())
            emptyCommits()         
   return Response(eventStream(), mimetype="text/event-stream")
@app.route('/getFilesData')
def getFilesData():
     return FilesData(request.args.get('files'))    


if __name__ == '__main__':
   app.run(debug = True)
   global commits
   commits = ''

