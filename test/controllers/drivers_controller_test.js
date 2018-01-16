const assert = require('assert');
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const Driver = mongoose.model('driver');

describe('Drivers controller', () => {

  it('Post to /api/drivers creates a new driver', done => {
    Driver.count().then(count => {
      request(app)
        .post('/api/drivers')
        .send({ email: 'test@test.com' })
        .end(() => {
          Driver.count().then(newCount => {
            assert(count + 1 === newCount);
            done();
          });
        });
    });
  });

  it('PUT to /api/drivers/id edits an existing driver', done => {
    // create the driver, edit the driver, pull out the driver that was updated
    const driver = new Driver({ email : 't@t.com', driving: false });

    // use supertest to make a PUT request
    driver.save().then(() => {
      request(app)
        .put( `/api/drivers/${driver._id}` )
        // .put('/api/drivers/' + driver._id )
        .send({ driving: true })              // send the update
        .end(() => {
          Driver.findOne({ email: 't@t.com' })
            .then(driver => {
              assert(driver.driving === true)
              done();
            }).catch(err => done(err));
        });
    });
  });

  it('DELETE to /api/drivers/id deletes an existing driver', done => {
    const driver = new Driver({ email: 'test@test.com' });

    driver.save().then(() => {
      request(app)
        .delete(`/api/drivers/${driver._id}`)
        .end(() => {
          Driver.findOne({ email: 'test@test.com'})
            .then((driver) => {
              assert(driver === null);
              done();
            }).catch(err => done(err));
        });
    });
  });

  it('GET to /api/drivers/id finds drivers in a location', done => {
      const bostonDriver = new Driver({
          email: 'boston@test.com',
          geometry: { type: 'Point', coordinates: [-71.0589, 42.3601] }
      });

      const seattleDriver = new Driver({
        email : 'seattle@test.com',
        geometry : { type: 'Point', coordinates: [-122.4759902, 47.6147628]}
      });
      const miamiDriver = new Driver({
        email : 'miami@test.com',
        geometry : { type: 'Point', coordinates: [-80.253, 25.791]}
      });

      Promise.all([ bostonDriver.save(), seattleDriver.save(), miamiDriver.save() ])
        .then(() => {
          request(app)
            .get('/api/drivers?lng=-71&lat=42')
            .end((err, response) => {
              // console.log(response);
              assert(response.body.length === 1);
              assert(response.body[0].obj.email === 'boston@test.com')
              done();
            });
        });

  });

});
