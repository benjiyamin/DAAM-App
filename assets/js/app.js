function starsHtml(rating, maxRating = 5) {
  let html = ''
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
  if (categories) {
    return categories.map(function (category) {
      return category.title
    }).join(', ')
  }
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

function formattedPhone(phoneString) {
  var cleaned = ('' + phoneString).replace(/\D/g, '')
  var match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    var intlCode = (match[1] ? '+1 ' : '')
    return [intlCode, '(', match[2], ') ', match[3], '-', match[4]].join('')
  }
  return null
}

function Application(storage) {
  let self = this
  this.zipCode = undefined
  this.date = undefined
  this.startTime = undefined
  this.endTime = undefined
  this.movies = []
  this.movie = undefined
  this.theaters = []
  this.showtime = undefined
  this.restaurants = []
  this.restaurant = undefined
  this.rides = []
  let yelpApi = 'cqri1UB-gnIXTN3mPx4GAi4vRAEpWc7KDG3n3HS2uC6nNBaG45cH3_8Wi7aPN1v5GHjHihhJ5MVWUHC1f8N1muxqS8Muqtp9FdqtWe3FVvY3CI0uDVpshApC41nEXHYx'
  let tmsApi = 'kq8d5zhpr87bvbz6cufpdgqt'
  let gmapsApi = 'AIzaSyDWFMiZeZwNNAdJUZsfMZ7edVnxgLOSfDs'
  let omdbApi = 'bd02b758'
  let geoUser = 'mohican'
  let uberToken = 'VueW1n9COS5QSaDnRzfYKJjI26euN7SN_QiYHEVS'

  this.checkInputs = function () {
    let zipCode = $('#zipCodeInput').val().trim()
    let date = $('#dateInput').val().trim()
    let startTime = $('#startTimeInput').val().trim()
    let endTime = $('#endTimeInput').val().trim()
    let $homeNext = $('#homeNext')
    if (zipCode && date && startTime && endTime) {
      $homeNext.prop('disabled', false)
    } else {
      $homeNext.prop('disabled', true)
    }
  }

  this.renderMovies = function () {
    let $movieResults = $('#movieResults')
    $movieResults.empty()
    this.movies.forEach(movie => {
      let cardImg = $('<img>')
        .addClass('card-img h-100')
      let queryUrl = "https://www.omdbapi.com/?t=" + searchMovieTitle(movie.title) + "&y=" + movie.releaseYear + "&apikey=" + omdbApi;
      $.ajax({
        url: queryUrl,
        method: 'GET',
        dataType: 'json',
      }).done(function (data) {
        if (/(jpg|gif|png|JPG|GIF|PNG|JPEG|jpeg)$/.test(data.Poster)) { // image url as input
          cardImg.attr('src', data.Poster)
        } else {
          cardImg.attr('src', 'assets/images/default-movie.png')
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
        .text(runtimeMinutes(movie.runTime) + ' min')
      let cardBody = $('<div>')
        .addClass('card-body')
        .append(name, rating)
      let info = $('<div>')
        .addClass('col-md-8')
        .append(cardBody)
      let row = $('<div>')
        .addClass('row h-100 no-gutters')
        .append(poster, info)
      let card = $('<div>')
        .addClass('card h-100 movie-card')
        .append(row)
        .click(function () {
          let $movieNext = $('#movieNext')
          if ($(this).hasClass('selected')) {
            // None selected
            $movieNext.prop('disabled', true)
          } else {
            // Card selected
            $('.movie-card').removeClass('selected')
            $movieNext.prop('disabled', false)
            self.movie = movie
          }
          $(this).toggleClass('selected')
        })
      let col = $('<div>')
        .addClass('col-6 col-lg-4 mt-4')
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
    let queryUrl = 'https://data.tmsapi.com/v1.1/movies/showings?startDate=' + date + '&zip=' + zipCode + '&api_key=' + tmsApi
    storage.pull()
    let storedData = storage.retrieve(queryUrl)
    if (storedData) {
      console.log('Local data loaded')
      self.movies = storedData
      self.renderMovies()
    } else {
      $.ajax({
        url: queryUrl,
        method: 'GET',
        dataType: 'json',
      }).done(function (data) {
        console.log('Requested data loaded')
        self.movies = data
        self.renderMovies()
        storage.add(request = queryUrl, response = data)
        storage.push()
      })
    }
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
                let $showtimeNext = $('#showtimeNext')
                if ($(this).hasClass('active')) {
                  // None selected
                  $showtimeNext.prop('disabled', true)
                } else {
                  // Button selected
                  $('.btn-showtime').removeClass('active')
                  $showtimeNext.prop('disabled', false)
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
        .html(starsHtml(restaurant.rating))
      let info = $('<p>')
        .text(categoryString(restaurant.categories))
      if (restaurant.price) {
        info.prepend(restaurant.price + ' | ')
      }
      let main = $('<div>')
        .addClass('col')
        .append(rating, info)
      let phone = $('<p>')
        .text(formattedPhone(restaurant.phone))
      let address = $('<p>')
        .text(restaurant.location.address1)
      let contact = $('<div>')
        .addClass('col text-right')
        .append(phone, address)
      let row = $('<div>')
        .addClass('row card-text')
        .append(main, contact)
      let cardBody = $('<div>')
        .addClass('card-body')
        .append(name, row)
      let card = $('<div>')
        .addClass('card mt-4 restaurant-card')
        .append(cardBody)
        .click(function () {
          let $restaurantNext = $('#restaurantNext')
          if ($(this).hasClass('selected')) {
            // None selected
            $restaurantNext.prop('disabled', true)
          } else {
            // Card selected
            $('.restaurant-card').removeClass('selected')
            $restaurantNext.prop('disabled', false)
            self.restaurant = restaurant
          }
          $(this).toggleClass('selected')
        })
      $restaurantResults.append(card)
    })
    $('#restaurantsLoading').hide()
    $('#restaurantsLoader').show()
  }

  this.loadTheaterLocation = function (location) {
    let queryUrl = "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?limit=1&term=" + location + '&location=' + self.zipCode;
    $.ajax({
      url: queryUrl,
      headers: {
        'Authorization': 'Bearer ' + yelpApi,
      },
      method: 'GET',
      dataType: 'json',
    }).done(function (data) {
      self.showtime.theatre.coordinates = data.businesses[0].coordinates
    })
  }

  this.loadRestaurants = function (location, append = false) {
    if (!append) {
      $('#restaurantResults').empty()
    }
    $('#restaurantsLoading').show()
    $('#restaurantsLoader').hide()
    let offset = this.restaurants.length
    let queryUrl = "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term=restaurant&sort_by=distance&limit=5&offset=" + offset + "&location=" + location;
    $.ajax({
      url: queryUrl,
      headers: {
        'Authorization': 'Bearer ' + yelpApi,
      },
      method: 'GET',
      dataType: 'json',
    }).done(function (data) {
      self.restaurants = self.restaurants.concat(data.businesses)
      self.renderRestaurants()
    })
  }

  this.loadRides = function () {
    let startLat = this.showtime.theatre.coordinates.latitude
    let startLng = this.showtime.theatre.coordinates.longitude
    let endLat = this.restaurant.coordinates.latitude
    let endLng = this.restaurant.coordinates.longitude
    let queryUrl = 'https://cors-anywhere.herokuapp.com/https://api.uber.com/v1.2/estimates/price?start_latitude=' + startLat + '&start_longitude=' + startLng + '&end_latitude=' + endLat + '&end_longitude=' + endLng
    $.ajax({
      url: queryUrl,
      headers: {
        'Authorization': 'Token ' + uberToken
      },
      method: 'GET',
      dataType: 'json',
    }).done(function (data) {
      self.rides = data.prices
    })
  }

  this.renderCurrentLocation = function () {
    if ("geolocation" in navigator) {
      // check if geolocation is supported/enabled on current browser
      navigator.geolocation.getCurrentPosition(
        function success(position) {
          // for when getting location is a success
          let lat = position.coords.latitude
          let lng = position.coords.longitude
          let queryUrl = 'http://api.geonames.org/findNearbyPostalCodesJSON?maxRows=1&lat=' + lat + '&lng=' + lng + '&username=' + geoUser
          $.ajax({
            url: queryUrl,
            method: 'GET',
            dataType: 'json',
          }).done(function (data) {
            let zipCode = data.postalCodes[0].postalCode
            $('#zipCodeInput').val(zipCode)
            self.checkInputs()
          })
        },
        function error(error_message) {
          // for when getting location results in an error
          console.error('An error has occured while retrieving location ', error_message)
        }
      )
    } else {
      // geolocation is not supported
      // get your location some other way
      console.log('geolocation is not enabled on this browser')
    }
  }

  this.renderCurrentDate = function () {
    $('#dateInput').val(moment().format('YYYY-MM-DD'))
  }


  this.renderCurrentTime = function () {
    $('#startTimeInput').val(moment().format('HH:mm'))
    $('#endTimeInput').val(moment().endOf('day').format('HH:mm'))
  }

  $('.btn-prev').on('click', function () {
    let tabId = $(this)
      .closest('div.tab-pane')
      .prev()
      .attr('id')
    let $prevTab = $('#myTab a[href="#' + tabId + '"]')
    $prevTab.removeClass('disabled')
    $prevTab.tab('show')
    $prevTab.addClass('disabled')
  })

  $('.btn-next').on('click', function () {
    let tabId = $(this)
      .closest('div.tab-pane')
      .next()
      .attr('id')
    let $nextTab = $('#myTab a[href="#' + tabId + '"]')
    $nextTab.removeClass('disabled')
    $nextTab.tab('show')
    $nextTab.addClass('disabled')
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
    let zipCode = $('#zipCodeInput').val().trim()
    let date = $('#dateInput').val().trim()
    let startTime = $('#startTimeInput').val().trim()
    let endTime = $('#endTimeInput').val().trim()
    let $theaterZipcode = $('#theaterZipcode')
    //if ($movieTitle.text() !== self.movie.title || $theaterZipcode.text() !== self.zipCode) {
    if ($movieTitle.text() !== self.movie.title || zipCode !== self.zipCode || date !== self.date ||
      startTime !== self.startTime || endTime !== self.endTime) {
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
      self.loadTheaterLocation(self.showtime.theatre.name)
    }
  })

  $('#restaurantsBtn').on('click', function () {
    self.loadRestaurants(self.showtime.theatre.name, append = true)
    self.loadTheaterLocation(self.showtime.theatre.name)
  })

  $('#restaurantNext, #summary-tab').on('click', function () {
    self.loadRides()
  })

  //$('#zipCodeInput, #dateInput, #startTimeInput, #endTimeInput').on('blur', function () {
  //  self.checkInputs()
  //})

}