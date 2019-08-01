from flask import Flask
from push import *
app = Flask(__name__)

@app.route('/')
def hello_world():
   return Commits[1].author

@app.route('/commit')
def commit():
   return Commits[1].hash   

if __name__ == '__main__':
   app.run(debug = True)
