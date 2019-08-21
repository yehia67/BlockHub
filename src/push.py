import os
import json
#Objects
class changes:
      removeFiles =[]
      addFiles = []
      removLines = []
      addLines = []

class commit:
      def __init__(self,hash,author,date,message):
          self.hash = hash
          self.author =author
          self.date = date 
          self.message = message
          self.Changes = changes()
     
      
      def addRemovedFiles(self,removeDirectory):
          self.Changes.removeFiles.append(removeDirectory)
      def addAddFiles(self,addDirectory):
          self.Changes.addFiles.append(addDirectory) 
      def addRemovedLines(self,removeLines):
          self.Changes.removLines.append(removeLines)
      def addAddLines(self,addLines):
          self.Changes.addLines.append(addLines)         

def get_str_between(s, before, after):
    splitted = s.split(" ")
    counterString = splitted[1]
    if counterString.find(",") != -1:
        counterString = counterString.split(",")[0]
    
    return counterString[1:len(counterString)]

#Use os Module


gitLogCommand = os.popen('git log').read()
Commits = [] 
splitAllCommits = gitLogCommand.split('commit')
splitAllCommits.reverse()
commitsJson = {}

for i in range(0,len(splitAllCommits)):
    #print(splitAllCommits)
    splitCommit = splitAllCommits[i].split("\n")
   
    makeThemAllInOneString = splitCommit
    makeThemAllInOneString = " ".join(makeThemAllInOneString)
    checkForMerge = "Merge: " in makeThemAllInOneString
    checkForRevert = "This reverts " in makeThemAllInOneString
    checkIfCommit = "Author: " in makeThemAllInOneString
    if checkForMerge or checkForRevert or not(checkIfCommit) :
       continue 
   
    commitDict = {}
    commitHash = splitCommit[0]
    commitHash = commitHash[1:]
    commitDict.update({"hash" : commitHash})
    commitAuthor = splitCommit[1].split(":")
    commitAuthor = commitAuthor[1]
    commitAuthor =commitAuthor[1:]
    commitDict.update({"author" : commitAuthor})
    commitDate = splitCommit[2].split("Date")
    commitDate = commitDate[1]
    commitDate =commitDate[4:]
    commitDict.update({"date":commitDate})
    commitMsg = splitCommit[4]
    commitMsg =commitMsg[4:]
    commitDict.update({"message":commitMsg})
    commitsJson.update({"commit#"+commitHash:commitDict})
    #print(commitDict)
    #print(commitsJson)
    Commits.append(commit(commitHash,commitAuthor,commitDate,commitMsg))

# if len(Commits) == 1:
#     print(Commits[0].hash)
#     print("---------------------------")
#     commitDict = commitsJson["commit#"+Commits[0].hash]
#     change = {}
#     getDeletedFiles = os.popen('git diff --name-only   --diff-filter=D  '+ Commits[0].hash +' ' + Commits[1].hash).read()
#     if getDeletedFiles != '':
#         filesDeleted = getDeletedFiles.split("\n")
#         Commits[1].addRemovedFiles(filesDeleted)
#         change.update({"files deleted": filesDeleted})
#     getCreatedFiles = os.popen('git diff --name-only   --diff-filter=A  '+ Commits[0].hash +' ' + Commits[1].hash).read()
#     if  getCreatedFiles != '':
#         filesAdded = getCreatedFiles.split("\n")
#         change.update({"files added" : filesAdded})
#         Commits[1].addAddFiles(filesAdded)
#     commitDict.update({"change": change})
#     commitsJson.update({"commit#"+Commits[0].hash:commitDict})
  
for i in range(0,len(Commits) - 1):
    # print(Commits[i].hash)
    # print("---------------------------")
    commitDict = commitsJson["commit#"+Commits[i + 1].hash]
    change = {}
    getDeletedFiles = os.popen('git diff --name-only   --diff-filter=D  '+ Commits[i].hash +' ' + Commits[i+1].hash).read()
    if getDeletedFiles != '':
        filesDeleted = getDeletedFiles.split("\n")
        Commits[i+1].addRemovedFiles(filesDeleted)
        change.update({"files deleted": filesDeleted})
    getCreatedFiles = os.popen('git diff --name-only   --diff-filter=A  '+ Commits[i].hash +' ' + Commits[i+1].hash).read()
    if  getCreatedFiles != '':
        filesAdded = getCreatedFiles.split("\n")
        change.update({"files added" : filesAdded})
        Commits[i+1].addAddFiles(filesAdded)
    commitDict.update({"change": change})
    commitsJson.update({"commit#"+Commits[i + 1].hash:commitDict})


for z in range(0,len(Commits)-1):     
    # getModifiedFiles = os.popen('git diff    --diff-filter=M  '+  Commits[z].hash +' ' + Commits[z+1].hash).read()
    # getModifiedFilesNames = getModifiedFiles.split("diff --git a")
    # commitDict = commitsJson["commit#"+Commits[z].hash]
    # for i in range(1,len(getModifiedFilesNames)): 
        
    #     changes = getModifiedFilesNames[i]
        
    #     #get file name & location
    #     spaceIndeces = changes.find(" ")
    #     #print(changes)
    #     filename = changes[0:spaceIndeces]
    #     addedLines = ""
    #     removedLines = ""
    #     addedLinesList = []
    #     removedLinesList = []
    #     #print("File location " + filename + " new Lines At :")

        
    #     lineChanges = changes.split("\n")
    #     #print(lineChanges)
    #     for j in range(0,len(lineChanges)):
    #         addedLineChange = {}
    #         removedLineChange = {}
    #         line =  lineChanges[j]
    #         counter = ""
    #         if line[0:4] == "@@ -": 
    #             counter = get_str_between(lineChanges[j],"@@ -",",") 
    #             j = j + 1
    #             while j < len(lineChanges):
    #                 line = lineChanges[j]
    #                 if line[0:4] == "@@ -":
    #                     j = j - 1
    #                     break
    #                 if line[0:2] == "+ ":
    #                     addedLines += filename + "" + "@@@" + str(counter) + "@@@"+ line[2:len(line)]+ "\n\n"
    #                     addedLineChange.update({"location" : filename, "line number" : counter, "line" : line[2:len(line)]})
    #                     counter = int(counter) + 1
    #                 elif line[0:2] == "- ":
    #                     removedLines += filename + "" + "@@@" + str(counter) + "@@@"+line[2:len(line)]+"\n\n"
    #                     removedLineChange.update({"location" : filename, "line number" : counter, "line" : line[2:len(line)]})
    #                     counter = int(counter) + 1
    #                 else:
    #                     counter = int(counter) + 1
    #                 j = j +1
    #                 print(addedLinesList)
    #                 addedLinesList.append(addedLineChange)
    #                 removedLinesList.append(removedLineChange)

                
    #     Commits[z+1].addAddLines(addedLines)
    #     Commits[z+1].addRemovedLines(removedLines)
    #     commitDictChanges = commitDict["change"]
    #     commitDictChanges.update({"Added Lines" : addedLinesList}) 
    #     commitDictChanges.update({"Removed Lines" : removedLinesList})
    getModifiedFiles = os.popen('git diff    --diff-filter=M  '+  Commits[z].hash +' ' + Commits[z+1].hash).read()
    getModifiedFilesNames = getModifiedFiles.split("diff --git a")

    commitDict = commitsJson["commit#"+Commits[z + 1].hash]

    # for i in range(0,len(getModifiedFilesNames)):
    #     print(getModifiedFilesNames[i])
    #     print("___________________________")

    addLinesList = []
    removedLinesList = []

    for i in range(1,len(getModifiedFilesNames)): 
        
        changes = getModifiedFilesNames[i]
        
        #get file name & location
        spaceIndeces = changes.find(" ")
        filename = changes[0:spaceIndeces]
        addedLines = "File location " + filename + " new Lines At :"
        removedLines = "File location " + filename + " removed Lines At :"
        addLinesDict = {"File Location" : filename}
        removedLinesDict = {"File Location" : filename}
        
        lineChanges = changes.split("\n")
        for j in range(0,len(lineChanges)):
            line =  lineChanges[j]
            counter = ""
            if line[0:4] == "@@ -": 
                counter = get_str_between(lineChanges[j],"@@ -",",") 
                j = j + 1
                while j < len(lineChanges):
                    line = lineChanges[j]
                    if line[0:4] == "@@ -":
                        j = j - 1
                        break
                    if line[0:1] == "+":
                        addedLines += "\n\n" + "Line " + str(counter) + " with content: " +"\n\n"+ line[1:len(line)]+ "\n\n"
                        addLinesDict.update({"Line#" + str(counter) : {"number" : str(counter), "content" : line[1:len(line)]}})
                        counter = int(counter) + 1
                    elif line[0:1] == "-":
                        removedLines += "\n\n" + "Line " + str(counter) + " with content " + "\n\n"+line[1:len(line)]+"\n\n"
                        removedLinesDict.update({"Line#" + str(counter) : {"number" : str(counter), "content" : line[1:len(line)]}})
                        counter = int(counter) + 1
                    else:
                        counter = int(float(counter)) + 1
                    j = j +1
        addLinesList.append(addLinesDict)
        removedLinesList.append(removedLinesDict)
        Commits[z+1].addAddLines(addedLines)
        Commits[z+1].addRemovedLines(removedLines) 

        commitDictChanges = commitDict["change"]
        commitDictChanges.update({"Added Lines" : addLinesList})
        commitDictChanges.update({"Removed Lines" : removedLinesList})
        commitDict.update({"change":commitDictChanges})
        commitsJson.update({"commit#"+Commits[z + 1].hash:commitDict})
        #print(commitDict)  
commitsJsonObject = json.dumps(commitsJson)
            

                
def showChange():
    print(commitsJson["commit#52ae8e3ce6478f1b1b21a5f02c2ad305c652b6b8"])
    # print(Commits[-1].hash)
    # print(Commits[-1].Changes.addLines)
    # print("===================")
    # print("new files :")
    # print(Commits[-1].Changes.addFiles)
    # print("____________________________________________________________________")
    # print("-----------------------------------------------------------")
    # print("remove files :")
    # print(Commits[-1].Changes.removeFiles)    
    # print("____________________________________________________________________")
    # print(Commits[-1].Changes.addLines)
    # print("____________________________________________________________________")
    # print(Commits[-1].Changes.removLines) 
    # print("____________________________________________________________________")
   

#showChange()

#test()

def returnDifference(recLength):
    #print(commitsJson)
    # print(len(Commits))
    if(int(recLength) > len(Commits)):
        return "error"
    elif(int(recLength) < len(Commits)):
        var = len(Commits) - recLength
        counter = -1
        tempDict = []
        while var > 0:
            tempCommit = {list(commitsJson.keys())[counter] : commitsJson[list(commitsJson.keys())[counter]]}
            commitObj = tempCommit.get(list(tempCommit.keys())[0])
            # print(commitObj)
            if(commitObj.get('change') != None):
                tempDict.append(tempCommit)
            counter -= 1
            var -= 1
        tempDict.reverse()
        return json.dumps(tempDict)
    else:
        return "equal"

# print(commitsJsonObject)
print(returnDifference(1))