import os
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
     beforeIndex = s.find(before)
     afterIndex = s.find(after)
     return s[beforeIndex+len(before):afterIndex]

#Use os Module


gitLogCommand = os.popen('git log').read()
Commits = [] 
splitAllCommits = gitLogCommand.split('commit')
splitAllCommits.reverse()

for i in range(1,len(splitAllCommits)):
    splitCommit = splitAllCommits[i].split("\n")
   
    makeThemAllInOneString = splitCommit
    makeThemAllInOneString = " ".join(makeThemAllInOneString)
    checkForMerge = "Merge: " in makeThemAllInOneString
    checkForRevert = "This reverts " in makeThemAllInOneString
    checkIfCommit = "Author: " in makeThemAllInOneString
    if checkForMerge or checkForRevert or not(checkIfCommit) :
       continue 
   
    commitHash = splitCommit[0]
    commitHash = commitHash[1:]
    commitAuthor = splitCommit[1].split(":")
    commitAuthor = commitAuthor[1]
    commitAuthor =commitAuthor[1:]
    commitDate = splitCommit[2].split("Date")
    commitDate = commitDate[1]
    commitDate =commitDate[4:]
    commitMsg = splitCommit[4]
    commitMsg =commitMsg[4:]
    Commits.append(commit(commitHash,commitAuthor,commitDate,commitMsg))
  
for i in range(0,len(Commits)-1):
    print(Commits[i].hash)
    print("---------------------------")
    getDeletedFiles = os.popen('git diff --name-only   --diff-filter=D  '+ Commits[i].hash +' ' + Commits[i+1].hash).read()
    if getDeletedFiles != '':
        Commits[i+1].addRemovedFiles(getDeletedFiles)
    getCreatedFiles = os.popen('git diff --name-only   --diff-filter=A  '+ Commits[i].hash +' ' + Commits[i+1].hash).read()
    if  getCreatedFiles != '':
        Commits[i+1].addAddFiles(getCreatedFiles)   
  
  
  
for z in range(0,len(Commits)-1):     
    getModifiedFiles = os.popen('git diff    --diff-filter=M  '+  Commits[z].hash +' ' + Commits[z+1].hash).read()
    getModifiedFilesNames = getModifiedFiles.split("diff --git a")
    for i in range(1,len(getModifiedFilesNames)): 
        
        changes = getModifiedFilesNames[i]
        
        #get file name & location
        spaceIndeces = changes.find(" ")
        filename = changes[0:spaceIndeces]
        addedLines = "File location " + filename + " new Lines At :"
        removedLines = "File location " + filename + " removed Lines At :"
        
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
                    if line[0:2] == "+ ":
                        addedLines += "\n\n" + "Line " + str(counter) + " with content: " +"\n\n"+ line[2:len(line)]+ "\n\n"
                        counter = int(counter) + 1
                    elif line[0:2] == "- ":
                        removedLines += "\n\n" + "Line " + str(counter) + " with content " + "\n\n"+line[2:len(line)]+"\n\n"
                        counter = int(counter) + 1
                    else:
                        counter = int(counter) + 1
                    j = j +1
        Commits[z+1].addAddLines(addedLines)
        Commits[z+1].addRemovedLines(removedLines)                 
            
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
def showChanges():
    print(Commits[5].Changes.removeFiles) 
                 
               




   
   
       





 

 

 