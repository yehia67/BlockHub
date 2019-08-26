from push import *
from actions import *

# if len(solidityCommits) == len(Commits):
#     print("Your code is Already Ip To Date")
# elif len(solidityCommits) < len(Commits):
#     print("You need to push")
# elif len(solidityCommits) > len(Commits):
#      counter = len(Commits)-1
#      for i in range(counter,len(solidityCommits)):
#          pullCommit(i,solidityCommits[i].authorName,solidityCommits[i].commitHash,
#              solidityCommits[i].date,solidityCommits[i].message,solidityCommits[i].addedFiles,solidityCommits[i].addLines,solidityCommits[i].removeFiles,solidityCommits[i].RemoveLines)

# info = ""
# with open('info.json') as f:
#     info = json.load(f)
#     print(info)


tempCommit = {list(commitsJson.keys())[-1] : commitsJson[list(commitsJson.keys())[-1]]}
commitObj = tempCommit.get(list(tempCommit.keys())[0])
 
   
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
    if(addedFiles):
        for i in range(0,len(addedFiles) - 1):
            createFile(addedFiles[i],"")

    #deleteFiles
    if(removedFiles):
        for i in range(0,len(removedFiles) - 1):
            deleteFile(removedFiles[i])     

    if(removedLines):
        for i in range(0,len(removedLines)):
            tmpDict = removedLines[i]
            location = tmpDict.get("File Location")
            if(len(tmpDict.keys()) > 1):
                for j in range(1, len(tmpDict.keys())):
                    tmpDictLine = tmpDict.get(list(tmpDict.keys())[1])
                    if(tmpDictLine != None):
                        number = int(tmpDictLine.get("number"))
                        content = tmpDictLine.get("content")
                        deleteLines(location, number, content) 

    #add Lines
    if(addedLines):
        for i in range(0,len(addedLines)):
            tmpDict = addedLines[i]
            location = tmpDict.get("File Location")
            if(len(tmpDict.keys()) > 1):
                for j in range(1, len(tmpDict.keys())):
                    tmpDictLine = tmpDict.get(list(tmpDict.keys())[j])
                    if(tmpDictLine != None):
                        number = int(tmpDictLine.get("number"))
                        content = tmpDictLine.get("content")
                        addLines(location, number, content)  

change = commitObj.get("change")
commitsAction(change.get("files added"), change.get("Added Lines"), change.get("files deleted") , change.get("Removed Lines"))






