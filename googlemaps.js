var NodeGeocoder = require("node-geocoder")

 function codeAdresse (adresse) {
    var options = {
      provider : 'google',
      httpAdapter : 'https',
      apiKey : 'AIzaSyDSWoLFFZuR8O2uTZgfmOkB1yW18XOnli0',
      formatter : null
    }
    
    var geocoder = NodeGeocoder(options)
    
    geocoder.geocode(adresse, (err, results) => {
      if (err) {
        console.log(err) 
      } else {
        console.log(results)
      }
    })
}

module.exports = codeAdresse