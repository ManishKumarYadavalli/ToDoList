//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];
mongoose.connect("mongodb+srv://admin-YMK:todolistproject@cluster0.icji9rm.mongodb.net/todolistDB");

const itemsSchema = new mongoose.Schema({
  name : String
});

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name : "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name : "<-- Hit this to delete an item."
});

const defaultItems = [item1,item2,item3];

// Item.insertMany(defaultItems);

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {

  async function printItem(){
    const items = await Item.find();
    if(items.length === 0){
      Item.insertMany(defaultItems);
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: items});
    }
  };
  printItem();
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name : itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    foundListName();
    async function foundListName(){
      const foundName = await List.findOne({name: listName});
      if(foundName){
        foundName.items.push(item);
        foundName.save();
        res.redirect("/" + listName);
      }
    }
  }

});

app.post("/delete",(req,res)=>{
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  
  if(listName === "Today"){
    Item.findByIdAndDelete(checkedItemId).then(function(){
      res.redirect("/");
    });
  }
  else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}).then(function(){
      res.redirect("/" + listName);
    });
  }
  
});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });
app.get("/:customListName",(req,res)=>{
  const customListName = _.capitalize(req.params.customListName);
  // console.log(customListName);
  foundList();
  async function foundList(){
    const foundItem = await List.findOne({name: customListName});
    if(!foundItem){
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + customListName);
    }
    else{
      res.render("list", {listTitle: foundItem.name, newListItems: foundItem.items});
    }
  }
  
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;

if(port == null || ""){
  port = 3000;
}

app.listen(port, function() {
  console.log(`Server started on port ${port}`);
});
