//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
mongoose.set('strictQuery', true);
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://1234567890:1234567890@cluster0.ruqhhsi.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemSchema = {
  name: String
}

const Item = mongoose.model(
  "Item",
  itemSchema
)


const df1 = new Item({
  name: "Welcome to your todoList"
});

const df2 = new Item({
  name: "Hit the plus button to add a new one."
});

const df3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [df1, df2, df3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model(
  "List",
  listSchema
);

// Item.insertMany(defaultItems);

app.get("/", function(req, res) {

  Item.find().then(function(myItems) {
    if (myItems.length === 0) {
      Item.insertMany(defaultItems).catch(function(err) {
        if (err) {
          console.log(err); 
        } else {
          console.log("succeffully saved items to db!");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: myItems});
    }

  }).catch(function(err) {
    if (err) {
      console.log(err);
    }
  });

});


app.get("/:lists", function(req, res) {
  const customName = _.capitalize(req.params.lists);
  List.findOne({name: customName}).then(function(foundList) {
      if (!foundList) {
        // console.log("doesn't exist!");
        const tempList = new List({
          name: customName,
          items: defaultItems
        });
        tempList.save();
        res.redirect("/" + customName);
      } else {
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    
  })
  .catch(function(err) {
    if (err) {
      console.log("There is an error!!")
    }
  });
  // 
  // console.log(req.params.pages);
});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });


  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}).then(function(listItems) {
      if (!listItems) {
        console.log("there is no such page");
      } else {
        listItems.items.push(item);
        listItems.save();
        res.redirect("/" + listName);
      }
    });
  }
  // item.save();
  // res.redirect("/");
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else { 
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId).then(function(response) {
      console.log("successfull!");
      res.redirect("/");
    })
    .catch(function(err) {
      if (err) {
        console.log(err);
      }
    })
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}).then(function(foundList) {
      if (!foundList) {
        console.log("Not found this list");
      } else {
        res.redirect("/" + listName);
      }
    }).catch(function(err) {
      if (err) {
        console.log(err);
      }
    })
  }

  // console.log(req.body.checkbox);
  
});


// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});



// Item.find().then(function(myItems) {
//   if (myItems.length === 0) {
//     Item.insertMany(defaultItems).catch(function(err) {
//       if (err) {
//         console.log(err); 
//       } else {
//         console.log("succeffully saved items to db!");
//       }
//     });
//     res.redirect("/");
//   } else {
//     res.render("list", {listTitle: "Today", newListItems: myItems});
//   }

// });



let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, () => {
  console.log("Server started successfully");
}); 
