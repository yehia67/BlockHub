import os
def deleteFile(deletedFile):
	if os.path.exists(deletedFile):
	  os.remove(deletedFile)
	else:
	  print("The file does not exist")

def createFile(fileDirectory,content):
    file_name = fileDirectory
    directoryNames = fileDirectory.split("/")
    for i in range(len(directoryNames) - 1):
        if(directoryNames[i] != ""):
            os.mkdir(directoryNames[i])
    print("name : ", directoryNames[-1])
    f = open(file_name, 'w+')  # open file in append mode
    f.write(content)
    f.close()

# def addLines(fileDirectory, index, content):
#     directoryNames = fileDirectory.split("/")
#     fileName = ""
#     print("feshew : ", directoryNames)
#     for i in range(len(directoryNames) - 1):
#         if(directoryNames[i] == ""):
#             continue
#         else:
#             fileName = fileName + directoryNames[i] + "/"
#             os.mkdir(directoryNames[i])
#     fileName += directoryNames[-1]
#     f = open(fileName, 'w+')  # open file in append mode
#     f.write(content)
#     f.close()
#     

# def deleteLines(fileDirectory, index, content):
#     with open(fileDirectory, 'r') as file:
#     # read a list of lines into data
#        data = file.readlines()
#        data[index] = content

def deleteLines(fileDirectory,index,content):
    print("IN DELETEFILES FUNCTION")
    print("index : ", index)
    print("content : ", content)
    file_name = ""
    directoryNames = fileDirectory.split("/")
    print(directoryNames)
    for i in range(len(directoryNames) - 1):
        if(directoryNames[i] == ""):
            continue
        else:
            fileName = fileName + directoryNames[i] + "/"
            os.mkdir(directoryNames[i])
    file_name += directoryNames[-1]
    print("file : ", file_name)
    with open(file_name, 'r') as file:
    # read a list of lines into data
        data = file.readlines()
        print("data : ", data)
        data[index - 1] = ""

    # and write everything back
    with open(file_name, 'w') as file:
          file.writelines( data )

def addLines(fileDirectory,index,content):
    print("IN ADDLINES FUNCTION")
    print("index : ", index)
    print("content : ", content)
    file_name = ""
    directoryNames = fileDirectory.split("/")
    for i in range(len(directoryNames) - 1):
        if(directoryNames[i] == ""):
            continue
        else:
            fileName = fileName + directoryNames[i] + "/"
            os.mkdir(directoryNames[i])
    file_name += directoryNames[-1]
    print("file : ", file_name)
    with open(file_name, 'r') as file:
    # read a list of lines into data
        data = file.readlines()
        print("data : ", data)
        data = data[0:index - 1] + [content + "\n"] + data[index - 1:]
        print("data after : ", data)
    # and write everything back
    with open(file_name, 'w') as file:
          file.writelines( data )







