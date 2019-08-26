def FilesData(files):
    newFiles = []
    for i in range(0,len(files)):
        fileInfo = files[i].split("**")
        f=open(fileInfo[2], "r")
        content = f.read()
        newFiles.append(fileInfo[0]+"**"+fileInfo[1]+"**"+content)
    return files    


