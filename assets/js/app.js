function starsHtml(rating, maxRating = 5) {
  let html = ''
  //let flooredRating = Math.floor(rating)
  for (let i = 0; i < maxRating; i++) {
    if (rating - i >= 1) {
      html += '<i class="fas fa-star"></i>'
    } else if (rating - i > 0) {
      html += '<i class="fas fa-star-half-alt"></i>'
    } else {
      html += '<i class="far fa-star"></i>'
    }
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
  this.movies = []
  this.movie = undefined
  //this.theater = undefined
  this.theaters = []
  this.showtime = undefined
  this.restaurants = []
  this.restaurant = undefined
  let yelpApi = 'cqri1UB-gnIXTN3mPx4GAi4vRAEpWc7KDG3n3HS2uC6nNBaG45cH3_8Wi7aPN1v5GHjHihhJ5MVWUHC1f8N1muxqS8Muqtp9FdqtWe3FVvY3CI0uDVpshApC41nEXHYx'
  let tmsApi = 'kq8d5zhpr87bvbz6cufpdgqt'
  let gmapsApi = 'AIzaSyDWFMiZeZwNNAdJUZsfMZ7edVnxgLOSfDs'
  let omdbApi = 'bd02b758'

  this.renderMovies = function () {
    let $movieResults = $('#movieResults')
    $movieResults.empty()
    this.movies.forEach(movie => {
      let cardImg = $('<img>')
        .addClass('card-img')
      let queryUrl = "https://www.omdbapi.com/?t=" + movie.title + "&apikey=" + omdbApi;
      $.ajax({
        url: queryUrl,
        method: 'GET',
        dataType: 'json',
      }).done(function (data) {
        if (/(jpg|gif|png|JPG|GIF|PNG|JPEG|jpeg)$/.test(data.Poster)){ // image url as input
          cardImg.attr('src', data.Poster)
        } else {
          cardImg.attr('src', 'https://via.placeholder.com/200x300')
        }
      })
      let poster = $('<div>')
        .addClass('col-md-4')
        .append(cardImg)
      let name = $('<h5>')
        .addClass('card-title')
        .text(movie.title + ' (' + movie.releaseYear + ')')
      let rating = $('<p>')
        .addClass('card-text')
        .text(movie.runTime)
      let cardBody = $('<div>')
        .addClass('card-body')
        .append(name, rating)
      let info = $('<div>')
        .addClass('col-md-8')
        .append(cardBody)
      let row = $('<div>')
        .addClass('row no-gutters')
        .append(poster, info)
      let card = $('<div>')
        .addClass('card movie-card')
        .append(row)
        .click(function () {
          let nextTabId = $(this)
            .closest('div.tab-pane')
            .next()
            .attr('id')
          let $nextTab = $('#myTab a[href="#' + nextTabId + '"]')
          let $movieNext = $('#movieNext')
          if ($(this).hasClass('border-primary')) {
            // None selected
            $movieNext.prop('disabled', true)
            $nextTab.addClass('disabled')
          } else {
            // Card selected
            $('.movie-card').removeClass('border-primary')
            $movieNext.prop('disabled', false)
            $nextTab.removeClass('disabled')
            self.movie = movie
          }
          $(this).toggleClass('border-primary')
        })
      let col = $('<div>')
        .addClass('col col-md-6 col-lg-4 mt-4')
        .append(card)
      $movieResults.append(col)
    })
  }

  this.loadMovies = function (zipcode) {
    let queryUrl = 'http://data.tmsapi.com/v1.1/movies/showings?startDate=2019-04-27&zip=' + zipcode + '&api_key=' + tmsApi
    $.ajax({
      url: queryUrl,
      method: 'GET',
      dataType: 'json',
    }).done(function (data) {
      self.movies = data
      self.renderMovies()
    })
  }

  this.renderShowtimes = function () {
    let $showtimeResults = $('#showtimeResults')
    $showtimeResults.empty()

    for (const theaterName in this.theaters) {
      if (this.theaters.hasOwnProperty(theaterName)) {
        const showtimes = this.theaters[theaterName];
        let name = $('<h5>')
          .addClass('card-title')
          .text(theaterName)
        let address = $('<p>')
          .addClass('card-text')
          .text('123 Movie Dr') // theater.address
        let location = $('<div>')
          .addClass('col-4')
          .append(name, address)
        let times = $('<div>')
          .addClass('col-8 text-right')
        showtimes.forEach(showtime => {
          let time = moment(showtime.dateTime).format('h:mm a')
          let button = $('<button>')
            //.attr('href', showtime.ticketURI)
            //.attr('data-toggle', 'button')
            .addClass('btn btn-lg btn-info btn-showtime')
            .text(time)
            .click(function () {
              let nextTabId = $(this)
                .closest('div.tab-pane')
                .next()
                .attr('id')
              let $nextTab = $('#myTab a[href="#' + nextTabId + '"]')
              let $showtimeNext = $('#showtimeNext')
              if ($(this).hasClass('active')) {
                // None selected
                $showtimeNext.prop('disabled', true)
                $nextTab.addClass('disabled')
              } else {
                // Button selected
                $('.btn-showtime').removeClass('active')
                $showtimeNext.prop('disabled', false)
                $nextTab.removeClass('disabled')
                self.showtime = showtime
              }
              $(this).toggleClass('active')
            })
          times.append(button)
        });
        let cardBody = $('<div>')
          .addClass('card-body row')
          .append(location, times)
        let card = $('<div>')
          .addClass('card mt-4 theater-card')
          .append(cardBody)
        $showtimeResults.append(card)
      }
    }
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
        .addClass('card mt-4 restaurant-card')
        .append(cardBody)
        .click(function () {
          let $restaurantNext = $('#restaurantNext')
          if ($(this).hasClass('border-primary')) {
            // None selected
            $restaurantNext.prop('disabled', true)
          } else {
            // Card selected
            $('.restaurant-card').removeClass('border-primary')
            $restaurantNext.prop('disabled', false)
            self.restaurant = restaurant
          }
          $(this).toggleClass('border-primary')
        })
      $restaurantResults.append(card)
    })
  }

  this.loadRestaurants = function (location) {
    let queryUrl = "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term=restaurant&sort_by=distance&limit=3&location=" + location;
    $.ajax({
      url: queryUrl,
      headers: {
        'Authorization': 'Bearer ' + yelpApi,
      },
      method: 'GET',
      dataType: 'json',
    }).done(function (data) {
      self.restaurants = data.businesses
      self.renderRestaurants()
    })
  }

  $('.btn-prev').on('click', function () {
    let tabId = $(this)
      .closest('div.tab-pane')
      .prev()
      .attr('id')
    $('#myTab a[href="#' + tabId + '"]').tab('show')
  })

  $('.btn-next').on('click', function () {
    let tabId = $(this)
      .closest('div.tab-pane')
      .next()
      .attr('id')
    $('#myTab a[href="#' + tabId + '"]').tab('show')
  })

  $('#movieNext').on('click', function () {
    self.theaters = _.groupBy(self.movie.showtimes, function (showtime) {
      return showtime.theatre.name
    })
    $('#movieTitle').text(self.movie.title)
    $('#theaterZipcode').text(self.zipCode)
    self.renderShowtimes()
  })

  $('#showtimeNext').on('click', function () {
    self.loadRestaurants(self.showtime.theatre.name)
    $('#theaterName').text(self.showtime.theatre.name)
  })

}