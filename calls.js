

fetch("http://127.0.0.1:8001/call")
.then(result =>  console.log(result))
// .then(newRes => console.log(newRes))
.catch(() => console.log("Error"))

// console.log(data)