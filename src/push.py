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
# c3e9bc2672301d709109f536aa5a6038eff1e2db    7acd6ec2a8abbde0a950de2520b12318483fd7f5      
def get_str_between(s, before, after):
    #  beforeIndex = s.find(before)
    #  afterIndex = s.find(after)
    #  print("before : ", before)
    #  print("after : ", after)
    #  print("s : ", s)
    #  return s[beforeIndex+len(before):afterIndex]
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

for i in range(1,len(splitAllCommits)):
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
  
for i in range(0,len(Commits)-1):
    print(Commits[i].hash)
    print("---------------------------")
    commitDict = commitsJson["commit#"+Commits[i].hash]
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
    commitsJson.update({"commit#"+Commits[i].hash:commitDict})


for z in range(0,len(Commits)-1):     
    getModifiedFiles = os.popen('git diff    --diff-filter=M  '+  Commits[z].hash +' ' + Commits[z+1].hash).read()
    getModifiedFilesNames = getModifiedFiles.split("diff --git a")
    commitDict = commitsJson["commit#"+Commits[z].hash]
    for i in range(1,len(getModifiedFilesNames)): 
        
        changes = getModifiedFilesNames[i]
        
        #get file name & location
        spaceIndeces = changes.find(" ")
        #print(changes)
        filename = changes[0:spaceIndeces]
        addedLines = ""
        removedLines = ""
        addedLinesList = []
        removedLinesList = []
        #print("File location " + filename + " new Lines At :")

        
        lineChanges = changes.split("\n")
        #print(lineChanges)
        for j in range(0,len(lineChanges)):
            addedLineChange = {}
            removedLineChange = {}
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
                    if line[0:2] == "+ ":
                        addedLines += filename + "" + "@@@" + str(counter) + "@@@"+ line[2:len(line)]+ "\n\n"
                        addedLineChange.update({"location" : filename, "line number" : counter, "line" : line[2:len(line)]})
                        counter = int(counter) + 1
                    elif line[0:2] == "- ":
                        removedLines += filename + "" + "@@@" + str(counter) + "@@@"+line[2:len(line)]+"\n\n"
                        removedLineChange.update({"location" : filename, "line number" : counter, "line" : line[2:len(line)]})
                        counter = int(counter) + 1
                    else:
                        counter = int(counter) + 1
                    j = j +1
                    if(addedLineChange):
                        addedLinesList.append(addedLineChange)
                    
                    if(removedLineChange):
                        removedLinesList.append(removedLineChange)

                
        Commits[z+1].addAddLines(addedLines)
        Commits[z+1].addRemovedLines(removedLines)
        commitDictChanges = commitDict["change"]
        if(addedLinesList):
            commitDictChanges.update({"Added Lines" : addedLinesList}) 

        if(removedLinesList):
            commitDictChanges.update({"Removed Lines" : removedLinesList})

        commitDict.update({"change":commitDictChanges})
        commitsJson.update({"commit#"+Commits[z].hash:commitDict})    
        #print(commitDict)  
commitsJsonObject = json.dumps(commitsJson)
#print(commitsJsonObject)
            
def test():
    for i in range(0,len(Commits)):
        print("____________________________________________________________________")
        print(Commits[i].hash)
        print("____________________________________________________________________")
        print(Commits[i].author)
        print("____________________________________________________________________")
        print(Commits[i].date)
        print("____________________________________________________________________")
        print(Commits[i].message)
        print("____________________________________________________________________") 
        print("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")
        print("new files :")
        print(Commits[i].Changes.addFiles)
        print("____________________________________________________________________")
        print("-----------------------------------------------------------")
        print("remove files :")
        print(Commits[i].Changes.removeFiles)    
        print("____________________________________________________________________")
        print(Commits[i].Changes.addLines)
        print("____________________________________________________________________")
        print(Commits[i].Changes.removLines) 
        print("____________________________________________________________________")
        print("*******************************************************************************************************************************************")
                
def showChange():
    print(commitsJson["commit#4368a333ac5bedc418445cf1a4a3b90c20c81af4"])
   

showChange()
   
       





 

 

 