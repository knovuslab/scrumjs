function getDate () {
  var d = new Date()
  return (
    d.getHours() +
    ':' +
    d.getMinutes() +
    ':' +
    d.getSeconds() +
    ' ' +
    d.getMonth() +
    '/' +
    d.getDate() +
    '/' +
    d.getFullYear()
  )
}
exports.getDate = getDate
