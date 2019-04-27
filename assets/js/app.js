function Application() {
  let self = this
  this.zipCode = undefined
  this.date = undefined
  this.startTime = undefined
  this.endTime = undefined
  this.theaters = [1, 2, 3]
  this.restaurants = [1, 2, 3]
  let yelpApi = 'cqri1UB-gnIXTN3mPx4GAi4vRAEpWc7KDG3n3HS2uC6nNBaG45cH3_8Wi7aPN1v5GHjHihhJ5MVWUHC1f8N1muxqS8Muqtp9FdqtWe3FVvY3CI0uDVpshApC41nEXHYx'

  this.getTheaters = function (zipcode) {}

  this.renderTheaters = function () {
    let $theaterResults = $('#theaterResults')
    $theaterResults.empty()
    this.theaters.forEach(theater => {
      let name = $('<h5>')
        .addClass('card-title')
        .text("Molly's Movies") // theater.name
      let address = $('<p>')
        .addClass('card-text')
        .text('123 Movie Dr') // theater.address
      let location = $('<div>')
        .addClass('col-4')
        .append(name, address)
      let times = $('<div>')
        .addClass('col-8 text-right')
      let cardBody = $('<div>')
        .addClass('card-body row')
        .append(location, times)
      let card = $('<div>')
        .addClass('card mt-4')
        .append(cardBody)
      $theaterResults.append(card)
    })
  }

  this.getRestaurants = function (address) {
    let queryUrl = "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term=restaurant&radius=5000&sort_by=distance&limit=5&location=" + address;

    $.ajax({
      url: queryUrl,
      headers: {
        'Authorization': 'Bearer ' + yelpApi,
      },
      method: 'GET',
      dataType: 'json',
      success: function (data) {
        console.log(data)
      }
    });
  }

  this.renderRestaurants = function () {
    let $restaurantResults = $('#restaurantResults')
    $restaurantResults.empty()
    this.restaurants.forEach(restaurant => {
      let name = $('<h5>')
        .addClass('card-title')
        .text("Trevor's Tacos")
      let rating = $('<p>')
        .addClass('card-text')
        .html('<i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star text-muted"></i><i class="fas fa-star text-muted"></i></p>')
      let cost = $('<p>')
        .addClass('card-text')
        .text('$$$$')
      let main = $('<div>')
        .addClass('col-4')
        .append(name, rating, cost)
      let phone = $('<p>')
        .text('(407) 201-3583')
      let address = $('<p>')
        .text('123 Burrito Rd')
      let contact = $('<div>')
        .addClass('col-8 text-right card-text')
        .append(phone, address)
      let cardBody = $('<div>')
        .addClass('card-body row')
        .append(main, contact)
      let card = $('<div>')
        .addClass('card mt-4')
        .append(cardBody)
      $restaurantResults.append(card)
    })
  }
}