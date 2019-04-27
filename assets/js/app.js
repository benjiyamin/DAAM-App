function Application() {
  let self = this
  this.zipCode = undefined
  this.date = undefined
  this.startTime = undefined
  this.endTime = undefined
  this.theaters = []
  this.restaurants = []

  this.render = function () {
    this.theaters.forEach(theater => {
      let name = $('<h5>')
        .addClass('card-title')
        .text("Molly's Movies") // theater.name
      let address = $('<p>')
        .addClass('card-text')
        .text('123 Movie Dr') // theater.address
      let locationInfo = $('<div>')
        .addClass('col-4')
        .append(name, address)
      let timeInfo = $('<div>')
        .addClass('col-8 text-right')
      let cardBody = $('<div>')
        .addClass('card-body row')
        .append(locationInfo, timeInfo)
      let card = $('<div>')
        .addClass('card mt-4')
        .append(cardBody)
      $('#theaterResults').append(card)
    });
  }

  this.getMovies = function (zipcode) {}



}