function Storage(expires = 24) {
  this.stored = []
  this.expires = expires

  this.add = function (request, response) {
    this.stored.push({
      request: request,
      response: response,
      created: new Date()
    })
    this.stored = _.uniq(this.stored, false, function (obj) {
      return obj.request;
    });
  }

  this.retrieve = function (request) {
    let obj = this.stored.filter(function (obj) {
      return obj.request === request
    })[0]
    if (obj) {
      return obj.response
    }
  }

  this.push = function () {
    localStorage.setItem('stored', JSON.stringify(this.stored))
  }

  this.pull = function (removeExpired = true) {
    let storedString = localStorage.getItem('stored')
    if (storedString) {
      this.stored = JSON.parse(localStorage.getItem('stored'))
      if (removeExpired) {
        today = new Date()
        for (let i = this.stored.length - 1; i >= 0; i--) {
          const obj = this.stored[i]
          if (moment().diff(moment(obj.created).add(expires, 'hours')) > 0) {
            this.stored.splice(i, 1); // Remove expired
          }
        }
      }
    } else {
      this.stored = []
    }
  }
}