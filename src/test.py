import os
# test get strings between
def get_str_between(s, before, after):
    splitted = s.split(" ")
    counterString = splitted[1]
    if counterString.find(",") != -1:
        counterString = counterString.split(",")[0]
    
    return counterString[1:len(counterString)]
#print(get_str_between("@@ -24,16 +24,14 @@ contract repo{","@@ -",","))

#test loop 
getModifiedFiles = os.popen('git diff --diff-filter=M 89ff9136c288f62a8b766e92328f115016108c34 1dd6b60c55c8d2292276fb734cc379cf2464d0b3').read()
getModifiedFilesNames = getModifiedFiles.split("diff --git a")
for i in range(1,len(getModifiedFilesNames)): 
        changes = getModifiedFilesNames[i]       
        #get file name & location
        spaceIndeces = changes.find(" ")
        filename = changes[0:spaceIndeces]
        addedLines = ""
        removedLines = ""
        addedLinesList = []
        removedLinesList = []       
        lineChanges = changes.split("\n")
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
                        print("New Filess")
                        print(addedLines)
                        print("-----------------------------------------------------------------------")
                        counter = int(counter) + 1
                    elif line[0:2] == "- ":
                        removedLines += filename + "" + "@@@" + str(counter) + "@@@"+line[2:len(line)]+"\n\n"
                        print("Delete Filess")
                        print(removedLines)
                        counter = int(counter) + 1
                        print("-----------------------------------------------------------------------")
                    else:
                        counter = int(counter) + 1
                    j = j +1
                   
