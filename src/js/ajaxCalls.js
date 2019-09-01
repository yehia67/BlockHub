SendAddedFilesToPython = (newAddedFiles, dir) => {
    const addedFiles = []
    for (let i = 0; i < newAddedFiles.length; i++) {
        let fileNameAndLocation = newAddedFiles[i].split('/')
        let name = fileNameAndLocation.pop()
        let location = newAddedFiles[i].replace(name, '')
            //Possible bug if we have directory inside directory
        if (name == "") { continue }

        addedFiles.push(name + "**" + dir + "/" + name + "**" + location)
    }
    $.ajax({
        type: 'GET',
        url: 'http://127.0.0.1:5000/getFilesData?files=' + addedFiles,

        success: function(response) {

            return App.IpfsHashForNewFiles(response)
        },
        error: function(response) {
            return console.error(response);
        }
    });

}