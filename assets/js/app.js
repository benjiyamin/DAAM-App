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

function runtimeMinutes(runtime) {
  runtimeArray = runtime.split(/[PTHM]+/)
  var hours = parseInt(runtimeArray[1])
  var minutes = parseInt(runtimeArray[2])
  return hours * 60 + minutes
}

function searchMovieTitle(movieTitle) {
  return movieTitle.replace('3D', '').trim()
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
      //let queryUrl = "https://www.omdbapi.com/?t=" + movie.title + "&apikey=" + omdbApi;
      let queryUrl = "https://www.omdbapi.com/?t=" + searchMovieTitle(movie.title) + "&y=" + movie.releaseYear + "&apikey=" + omdbApi;
      $.ajax({
        url: queryUrl,
        method: 'GET',
        dataType: 'json',
      }).done(function (data) {
        if (/(jpg|gif|png|JPG|GIF|PNG|JPEG|jpeg)$/.test(data.Poster)) { // image url as input
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
        //.text(movie.runTime)
        .text(runtimeMinutes(movie.runTime) + ' min')
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
    $('#moviesLoading').hide()
    $movieResults.show()
  }

  this.loadMovies = function (zipCode, date, startTime, endTime) {
    this.zipCode = zipCode
    this.date = date
    this.startTime = startTime
    this.endTime = endTime
    $('#moviesLoading').show()
    $('#movieResults').hide()
    let queryUrl = 'http://data.tmsapi.com/v1.1/movies/showings?startDate=' + date + '&zip=' + zipCode + '&api_key=' + tmsApi
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
          let time = moment(showtime.dateTime)
          let startTime = moment(self.date + 'T' + self.startTime)
          let endTime = moment(self.date + 'T' + self.endTime)
          if (time.isBetween(startTime, endTime)) {
            let button = $('<button>')
              .addClass('btn btn-info btn-showtime ml-1 mb-1')
              .text(time.format('h:mm a'))
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
          }
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
    $('#showtimesLoading').hide()
    $showtimeResults.show()
  }

  this.loadShowtimes = function () {
    $('#showtimesLoading').show()
    $('#showtimeResults').hide()
    self.theaters = _.groupBy(self.movie.showtimes, function (showtime) {
      return showtime.theatre.name
    })
    this.renderShowtimes()
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
    $('#restaurantsLoading').hide()
    $restaurantResults.show()
  }

  this.loadRestaurants = function (location) {
    $('#restaurantsLoading').show()
    $('#restaurantResults').hide()
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

  this.renderTodaysDate = function() {
    let today = new Date();
    $('#dateInput').val(moment(today).format('YYYY-MM-DD'))
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

  $('#homeNext, #movies-tab').on('click', function () {
    let zipCode = $('#zipCodeInput').val().trim()
    let date = $('#dateInput').val().trim()
    let startTime = $('#startTimeInput').val().trim()
    let endTime = $('#endTimeInput').val().trim()
    if (zipCode !== self.zipCode || date !== self.date || startTime !== self.startTime || endTime !== self.endTime) {
      self.loadMovies(zipCode, date, startTime, endTime)
      $('#movieZipcode').text(self.zipCode)
    }
  })

  $('#movieNext, #showtimes-tab').on('click', function () {
    let $movieTitle = $('#movieTitle')
    let $theaterZipcode = $('#theaterZipcode')
    if ($movieTitle.text() !== self.movie.title || $theaterZipcode.text() !== self.zipCode) {
      self.loadShowtimes()
      $movieTitle.text(self.movie.title)
      $theaterZipcode.text(self.zipCode)
    }
  })

  $('#showtimeNext, #restaurants-tab').on('click', function () {
    let $theaterName = $('#theaterName')
    if ($theaterName.text() !== self.showtime.theatre.name) {
      self.loadRestaurants(self.showtime.theatre.name)
      $theaterName.text(self.showtime.theatre.name)
    }
  })

  $('#restaurantNext, #summary-tab').on('click', function () {

  })

  $('#zipCodeInput, #dateInput, #startTimeInput, #endTimeInput').on('blur', function () {
    let zipCode = $('#zipCodeInput').val().trim()
    let date = $('#dateInput').val().trim()
    let startTime = $('#startTimeInput').val().trim()
    let endTime = $('#endTimeInput').val().trim()
    let nextTabId = $(this)
      .closest('div.tab-pane')
      .next()
      .attr('id')
    let $nextTab = $('#myTab a[href="#' + nextTabId + '"]')
    //let $homeNext = $('#homeNext')
    if (zipCode && date && startTime && endTime) {
      //$homeNext.prop('disabled', false)
      $nextTab.removeClass('disabled')
    } else {
      //$homeNext.prop('disabled', true)
      $nextTab.addClass('disabled')
    }
  })

}