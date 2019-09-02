uploadIPFS = (makeNewFilesArray) => {
    newFilesWithHashes = ""
    for (const item of makeNewFilesArray) {
        fileInfo = item.split("**")
        console.log(fileInfo[1])
        console.log(typeof fileInfo[0])
        let uploadedFile = {
            heading: fileInfo[0],
            content: fileInfo[2]
        };

        ipfs.add([Buffer.from(JSON.stringify(uploadedFile))], (err, res) => {
            if (err || !res) {
                return console.error('ipfs add error', err, res)
            }
            if (res && res[0].hash) {

                newFilesWithHashes += res[0].hash + "*" + fileInfo[1] + ","
                console.log(fileInfo[1])
                console.log(fileInfo[0])
            }
        });
    }
    return newFilesWithHashes
}

LoadRepoFiles = async(ipfsHashs) => {
    let ipfsFiles = ipfsHashs.split(',')
    console.log(ipfsFiles)
    if (ipfsHashs.length !== 0) {
        for (let index = 0; index < ipfsFiles.length - 1; index++) {
            let file = ipfsFiles[index].split("*")
            $("#repoFiles").append("<tr style='color:steelBlue;font-family:ABeeZee, sans-serif;font-size:18px;'><td" + " onclick= 'uploadFile(" + '"' + file[0] + '"' + ")'" + "style='cursor:pointer !important;' >" + file[1] + "</<td><td>" + file[2] + "</td>   </tr>")
        }
        showCommits(true)
    } else {
        showCommits(false)
    }

}

uploadFile = (hash) => {
    $("table").hide()
    display("filContent", hash)
}

getvalue = async() => {
    ipfs.cat(App.ipfsHash, function(err, res) {
        if (err || !res) {
            return console.error('ipfs cat error', err, res)
        }
        $('#getValue').html(res.toString())

    })
};
display = (diplayID, hash) => {
    ipfs.cat(hash, function(err, res) {
        if (err || !res) {
            return console.error('ipfs cat error', err, res)
        }
        $("#" + diplayID).html("<p>" + res.toString() + "</p>")
    })
}