from push import *
from actions import *
def pull(solidityCommits):
    localCommits = Commits
    if len(solidityCommits) == len(localCommits):
        print("Your code is Already Ip To Date")
    elif len(solidityCommits) < len(localCommits):
         print("You need to push")
    elif len(solidityCommits) > len(localCommits):
         counter = len(localCommits)-1
         for i in range(counter,len(solidityCommits)):
             localCommits.append(solidityCommits[i])
             #make actions
