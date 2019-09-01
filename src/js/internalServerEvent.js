var eventSource = new EventSource("http://127.0.0.1:5000/stream")
eventSource.onmessage = function(e) {
    if (e.data !== "wait") {
        console.log(e.data)
        console.log("------------------------------------------------------------------------")
        let commitInfo = e.data.split("&&&&")
        App.ConnectedToServer(commitInfo[1], commitInfo[0])

    }

}