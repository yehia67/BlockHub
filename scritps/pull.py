from push import *
from actions import *
    if len(solidityCommits) == len(localCommits):
        print("Your code is Already Ip To Date")
    elif len(solidityCommits) < len(localCommits):
         print("You need to push")
    elif len(solidityCommits) > len(localCommits):
         counter = len(localCommits)-1
         for i in range(counter,len(solidityCommits)):
             pullCommit(i,solidityCommits[i].authorName,solidityCommits[i].commitHash,
             solidityCommits[i].date,solidityCommits[i].message,solidityCommits[i].addedFiles,solidityCommits[i].addLines,solidityCommits[i].removeFiles,solidityCommits[i].RemoveLines)
           
 
 
 
 
   
def pullCommit(commitIndex,authorAddress,authorName,commitHash,date,message,addeFiles,addLines,removeFiles,RemoveLines):
   Commits[commitIndex].author = authorName
   Commits[commitIndex].hash = commitHash
   Commits[commitIndex].date = date
   Commits[commitIndex].message = message
   Commits[commitIndex].addAddFiles(addeFiles)
   Commits[commitIndex].addedLines(addLines)
   Commits[commitIndex].removedFiles(removeFiles)
   Commits[commitIndex].removedLines(RemoveLines)
   commitsAction(addeFiles,addLines,removeFiles,RemoveLines)

def commitsAction(addedFiles,addedLines,removedFiles,removedLines):
    #create Files
    for i in range(0,len(addedFiles)):
        createFile(addedFiles[i],"")
   
    #deleteFiles
    for i in range(0,len(removedFiles))
        deleteFile(removedFiles[i])     
   
   #add Lines
   for i in range(0,len(addedLines)):
       add = addedLines[i].split("@@@")
       addOrdeleteLines(add[0],add[1],add[2])
   
   #remove Lines
   for i in range(0,len(removedLines)):
       remove = addedLines[i].split("@@@")
       addOrdeleteLines(add[0],add[1],"")      