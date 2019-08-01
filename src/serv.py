from flask import Flask
from flask_cors import CORS
from push import *
app = Flask(__name__)
CORS(app)

@app.route('/')
def hello_world():
   return Commits[1].author

@app.route('/commit')
def commit():
   return Commits[1].hash   

if __name__ == '__main__':
   app.run(debug = True)
