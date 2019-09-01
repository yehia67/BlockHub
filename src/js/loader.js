showCommits = async(boolValue) => {
    //Hide Loader
    document.getElementById('loader').style.display = 'none'

    //Show Initial Commits
    if (boolValue) {
        console.log(document.getElementById('commitsDiv'))
        document.getElementById('commitsDiv').style.display = 'block'
        document.getElementById('noCommitBtn').style.display = 'none'
    }

    //No Initial Commits
    else {
        document.getElementById('commitsDiv').style.display = 'none'
        document.getElementById('noCommitBtn').style.display = 'block'
    }
};