describe('All Tests', function () {

  before(async function(){
  })

  // Require specs to consume
  require('require-dir')('./server/test', {
    recurse: true
  })

  after(async function(){
  })
})
