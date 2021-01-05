//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const _ = require('lodash');


const mongoose = require("mongoose"); // Mongoose module
const {
  result
} = require("lodash");
mongoose.connect("mongodb://localhost:27017/todolistDBv2"); // Connect to a mongoDB database named todolistDBv2

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

// ######
// ######
// ######
// --------------------------- MONGOOSE SCHEMA AND MODELS ---------------------------

const taskSchema = mongoose.Schema({
  task: String
});

const Task = new mongoose.model("Task", taskSchema);

const defaultTask1 = new Task({
  task: "Arrange stuff."
});

const defaultTask2 = new Task({
  task: "Drink water!"
});

const defaultTask3 = new Task({
  task: "Chill."
});


// const defaultTasksArray = [defaultTask1, defaultTask2, defaultTask3];
const defaultTasksArray = [];
Task.insertMany(defaultTasksArray); // Save Default documents to "items" collection generated by mongoose.model()

// ######
// ######
// ######
// --------------------------- SERVER REQUESTS ---------------------------

app.get("/", function (req, res) {
  Task.find({}, (err, tasksFound) => {
    if (!err) {
      console.log(tasksFound);

      res.render("list", {
        listTitle: "Today",
        newListItems: tasksFound
      })

    } else {
      console.log("Error retrieving data from DB.");
    }
  });
});

app.post("/", function (req, res) {
  const newTaskSource = req.body.list;
  const newTaskEntered = req.body.newTaskEntered;
  const newTask = new Task({
    task: newTaskEntered
  });
  if (newTaskSource === "Today") {
    newTask.save().then(() => {
      res.redirect('/');
    });
  } else {
    List.findOne({
      name: newTaskSource
    }, (err, result) => {
      if (!err) {
        if (result) {
          console.log(result);
          result.tasks.push(newTask);
          console.log(`Item pushed to list record: ${newTaskSource}`);
          result.save();
          res.redirect(`/${newTaskSource}`);

        }
      } else {
        console.log(err);
      }
    });
  }
});

app.post('/delete', (req, res) => {
  const checkedItemId = req.body.checkbox
  const checkedItemSource = req.body.listTitle
  console.log(checkedItemId);

  if (checkedItemSource === "Today") {
    Task.findOneAndDelete({
      _id: checkedItemId
    }, (err) => {
      if (!err) {
        console.log("Deleted task document from default task array");
        res.redirect('/');
      }
      console.error.bind("error", "Error in finding & deleting task from database.");
    });
  } else {
    List.findOneAndUpdate({
      name: checkedItemSource
    }, {
      $pull: {
        tasks: {
          _id: checkedItemId
        }
      }
    }, (err, result) => {
      if (!err) {
        if (result) {
          result.save();
          res.redirect(`/${checkedItemSource}`);
        }
      } else {
        console.log(err);
      }
    });
  }
});


// --------------------------- DYNAMIC ROUTING ---------------------------

const taskListSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter Task List Name."]
  },
  tasks: [taskSchema]
});

const List = new mongoose.model("List", taskListSchema);

app.get('/:newRoute', (req, res) => {
  const newListName = _.capitalize(req.params.newRoute);

  List.findOne({
    name: newListName
  }, (err, result) => {
    if (!err) {
      if (!result) {
        console.log("No Match found.");
        const list = new List({
          name: newListName,
          tasks: []
        });
        list.save();
        res.redirect(`/${newListName}`);
      } else {
        console.log("Match found.");
        console.log(result);
        res.render("list", {
          listTitle: result.name,
          newListItems: result.tasks
        })
      }
    }
  });

});









//########################## Listen to port 3000 ##########################

app.listen(3000, function () {
  console.log("Server started on port 3000");
});