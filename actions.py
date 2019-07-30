import os
def deleteFile(deletedFile)
	if os.path.exists(deletedFile):
	  os.remove(deletedFile)
	else:
	  print("The file does not exist")

def createFile(fileDirectory,content)
    file_name = fileDirectory
    f = open(file_name, 'a+')  # open file in append mode
    f.write(content)
    f.close()

#delete or add new line
def addOrdeleteLines(fileDirectory,index,content):
    with open(fileDirectory, 'r') as file:
    # read a list of lines into data
    data = file.readlines()
    data[index] = content
    # and write everything back
    with open(fileDirectory, 'w') as file:
    file.writelines( data )

