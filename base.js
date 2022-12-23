

exports.getData = (data) => {
    // console.log(data, "data");
    getArrayData(data)
}

const actualArray = []
function getArrayData(arr) {
    const tempArray = []
    tempArray.push(arr)
    actualArray.push(...tempArray)
}
console.log(actualArray, "ARRAY");
