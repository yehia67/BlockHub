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

display = (diplayID, hash) => {
    ipfs.cat(hash, function(err, res) {
        if (err || !res) {
            return console.error('ipfs cat error', err, res)
        }
        console.log(res.toString())
        $("#" + diplayID).html("<p>" + res.toString() + "</p>")
    })
}