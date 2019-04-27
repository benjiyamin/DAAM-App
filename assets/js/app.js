function starsHtml(rating, maxRating = 5) {
  let html = ''
  let flooredRating = Math.floor(rating)
  for (let i = 0; i < maxRating; i++) {
    if (i <= flooredRating) {
      html += '<i class="fas fa-star"></i>'
    } else {
      html += '<i class="fas fa-star text-muted"></i>'
    }
    //if (flooredRating - rating === 0.5) {
    //  html += '<i class="fas fa-star text-muted"></i>'
    //}

    //<i class="fas fa-star-half"></i>
  }
  return html
}

function categoryString(categories) {
  let string = ''
  categories.forEach(category => {
    string += ', ' + category.title
  });
  return string
}

function Application() {
  let self = this
  this.zipCode = undefined
  this.date = undefined
  this.startTime = undefined
  this.endTime = undefined
  this.theaters = [1, 2, 3]
  this.restaurants = []
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

  this.renderRestaurants = function () {

    let $restaurantResults = $('#restaurantResults')
    $restaurantResults.empty()
    this.restaurants.forEach(restaurant => {
      let name = $('<h5>')
        .addClass('card-title')
        .text(restaurant.name)
      let rating = $('<p>')
        .addClass('card-text')
        .html(starsHtml(restaurant.rating))
      let price = $('<p>')
        .addClass('card-text')
        .text(restaurant.price + ' | ' + categoryString(restaurant.categories))
      let main = $('<div>')
        .addClass('col-4')
        .append(name, rating, price)
      let phone = $('<p>')
        .text(restaurant.phone)
      let address = $('<p>')
        .text(restaurant.location.address1)
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

  this.loadRestaurants = function (address) {
    let queryUrl = "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term=restaurant&sort_by=distance&limit=5&location=" + address;
    $.ajax({
      url: queryUrl,
      headers: {
        'Authorization': 'Bearer ' + yelpApi,
      },
      method: 'GET',
      dataType: 'json',
    }).done(function(data) {
      self.restaurants = data.businesses
      self.renderRestaurants()
      console.log(data)
    })
  }
}