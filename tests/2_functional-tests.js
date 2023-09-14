const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

const projectName = 'apitest'
const url = '/api/issues/' + projectName;
let id = 0;
let id2 = 0;

chai.use(chaiHttp);

suite('Functional Tests', function() {
  test('Create an issue with every field: POST request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .keepOpen()
        .post(url)
        .send({
          issue_title: 'test',
          issue_text: 'test',
          created_by: 'test',
          assigned_to: 'test',
          status_text: 'test'
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.issue_title, 'test');
          assert.equal(res.body.issue_text, 'test');
          assert.equal(res.body.created_by, 'test');
          assert.equal(res.body.assigned_to, 'test');
          assert.equal(res.body.status_text, 'test');
          id = res.body._id;
          done();
        });
    });
  test('Create an issue with only required fields: POST request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .keepOpen()
        .post(url)
        .send({
          issue_title: 'test',
          issue_text: 'test',
          created_by: 'test',
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.issue_title, 'test');
          assert.equal(res.body.issue_text, 'test');
          assert.equal(res.body.created_by, 'test');
          assert.equal(res.body.assigned_to, '');
          assert.equal(res.body.status_text, '');
          id2 = res.body._id;
          done();
        });
    });
  test('Create an issue with missing required fields: POST request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .keepOpen()
        .post(url)
        .send({
          issue_title: 'test',
          issue_text: '',
          created_by: '',
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.error, 'required field(s) missing');
          done();
        });
    });
  
  test('View issues on a project: GET request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .keepOpen()
        .get(url)
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          done();
        });
    });
  test('View issues on a project with one filter: GET request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .keepOpen()
        .get(url + '?assigned_to=test')
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          done();
        });
    });
  test('View issues on a project with two filter: GET request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .keepOpen()
        .get(url + '?assigned_to=test&status_text=test')
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          done();
        });
    });
  test('Update one field on an issue: PUT request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .keepOpen()
        .put(url)
        .send({
          _id: id,
          issue_title: 'updated'
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.result, 'successfully updated');
          assert.equal(res.body._id, id);
          done();
        });
    });
  test('Update multiple fields on an issue: PUT request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .keepOpen()
        .put(url)
        .send({
          _id: id2,
          issue_title: 'updated',
          issue_text: 'updated',
          created_by: 'updated'
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.result, 'successfully updated');
          assert.equal(res.body._id, id2);
          done();
        });
    });
  test('Update an issue with missing _id: PUT request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .keepOpen()
        .put(url)
        .send({
          issue_title: 'updated'
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });
  test('Update an issue with no fields to update: PUT request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .keepOpen()
        .put(url)
        .send({
          _id: id2,
          issue_title: '',
          issue_text: '',
          created_by: ''
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.error, 'no update field(s) sent');
          assert.equal(res.body._id, id2);
          done();
        });
    });
  test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .keepOpen()
        .put(url)
        .send({
          _id: 'INVALID',
          issue_title: 'updated'
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.error, 'could not update');
          assert.equal(res.body._id, 'INVALID');
          done();
        });
    });
  test('Delete an issue: DELETE request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .keepOpen()
        .delete('/api/issues/apitest')
        .send({
          _id: id
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.result, 'successfully deleted');
          assert.equal(res.body._id, id);
          done();
        });
    });
  test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .keepOpen()
        .delete(url)
        .send({
          _id: 1111
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.error, 'could not delete');
          assert.equal(res.body._id, 1111);
          done();
        });
    });
  test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', function (done) {
      chai
        .request(server)
        .keepOpen()
        .delete('/api/issues/apitest')
        .send({
          _id: ''
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });
});
