def FilesData(files):
    newFiles =""
    filesArray = files.split("&&")
    for i in range(0,len(filesArray)):
        fileInfo = filesArray[i].split("**")
        if len(fileInfo) == 3:
            f=open(fileInfo[1], "r")
            content = f.read()
            newFiles += fileInfo[0]+"**"+fileInfo[1]+"**"+content +"&&"
    return newFiles    


