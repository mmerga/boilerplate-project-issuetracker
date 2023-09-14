'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.static('public'));

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Atlas connected successfully...'))
  .catch(err => console.log(err));
// DO NOT FORGET ABOUT .env  ->   NODE_ENV=test    and    MONGO_URI={moongoseUrl}
// Make Mongoose use `findOneAndUpdate()`. Note that this option is `true`
// by default, you need to set it to false.
mongoose.set('useFindAndModify', false);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const Schema = mongoose.Schema;

const issueSchema = new Schema({
  "issue_title": {
    type: String,
    required: true
  },
  "issue_text": {
    type: String,
    required: true
  }, 
  "created_on": {
    type: Date
  },
  "updated_on": {
    type: Date
   },
  "created_by": {
    type: String,
    required: true
   },
  "assigned_to": {
    type: String
   },
  "open": {
    type: Boolean
   },
  "status_text": {
    type: String
   }  ,
  "project": {
    type: String
  }
});

const Issue = mongoose.model("Issue", issueSchema);

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      if (Object.keys(req.query).length >= 1){
        let query = req.query;
        query.project = project;  
        Issue.find(query, (err, issues) => {
          if (err) {
              res.json({ error: err.message });
          }else{
            res.json(issues);
          }
        });
      }else{
        Issue.find({"project": project}, (err, issues) => {
          if (err) {
              res.json({ error: err.message });
          }
           res.json(issues);
        });
      }
    })
    
    .post(function (req, res){
      let project = req.params.project;
      if (!req.body.issue_title || !req.body.issue_text || !req.body.created_by) {
         res.json(
          { error: 'required field(s) missing' }
        );      
      }else{
        const {
                issue_title,
                issue_text,
                created_by,
              } = req.body;
        const assigned_to = req.body.assigned_to || "";
        const status_text = req.body.status_text || "";
        const date = new Date();
        const issue = new Issue({
              "project": project,
              "issue_title": issue_title,
              "issue_text": issue_text,
              "created_by": created_by,
              "assigned_to": assigned_to,
              "status_text": status_text,
              "open": true,
              "created_on": date,
              "updated_on": date
            });
        issue.save((err, issue) => {
          if (err) {
             res.json(err);
          }else if(!issue){
             res.json(err);
          }else{
            delete issue.project;
            res.json(issue);
          }
        });  
      }
    })
    
    .put(function (req, res){      
      if (!req.body._id) {
         res.json({ error: "missing _id" });
      }else{
        let noFields = true;
        for (let prop in req.body) {
          if (prop != '_id' && req.body[prop]) {
            noFields = false;
          }
        }
        if (noFields == true) {
          res.json({ 
            error: 'no update field(s) sent',
            _id: req.body._id 
          });           
        }else{ 
          const _id = req.body._id; // filter          
          let newFields = req.body;  // update
          delete newFields._id;
          delete newFields.open;
          if(req.body.open == 'false'){
            newFields.open = false;
          }
          newFields.updated_on = new Date();  // update
          Issue.findOneAndUpdate({ "_id": _id }, { $set: newFields}, {new: true}, (err, updated) => {  
            if(err){
               res.json({ error: 'could not update',  '_id': _id });
            }else if(updated instanceof Issue){  
               res.json({  result: 'successfully updated', '_id': _id });
            }else{
               res.json({ error: 'could not update', '_id': _id });
            }
          }); 
        }
      }  
    })
    
    .delete(function (req, res){
      //let project = req.params.project;
      if (!req.body._id) {
         res.json({ error: 'missing _id' });
      }else{
        const _id = req.body._id;
        Issue.findByIdAndRemove(_id, (err, removed) =>{
          if(err){
             res.json({ error: 'could not delete', '_id': _id });
          }else if( removed instanceof Issue){
             res.json({ result: 'successfully deleted', '_id': _id });
          }else{
             res.json({ error: 'could not delete', '_id': _id });
          }
        })
      }
    });
    
};
