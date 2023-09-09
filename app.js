const express= require("express");
const bodyParser=require("body-parser");
const mongoose = require("mongoose");
const _ =require("lodash");
// const date=require(__dirname+"/date.js");
const app=express();
// var items=["cook food", "eat food"];
var workItems=[];
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");
const itemsSchema = new mongoose.Schema({
    name: String
});
const Item = mongoose.model("Item", itemsSchema);

const item1= new Item({
    name : "Welcome to your todoList !"
});
const item2= new Item({
    name : "Hit the + button to add a new item"
});
const item3= new Item({
    name : "<-- Hit this to delete an item"
});
const defaultItems = [item1, item2, item3];

const listSchema = {
    name : String,
    items : [itemsSchema]
};
const List =mongoose.model("List", listSchema);


app.get("/", function(req, res){
   

    Item.find({}, function(err, foundItems){
    if(foundItems.length === 0)
    {
        Item.insertMany(defaultItems, function(err){
            if(err){
                console.log(err);
            }else{
                console.log("Successfully saved default items to database");
            }
        });
        res.redirect("/")        
    }else{
    res.render("list", {listTitle: "Today", newlistItems: foundItems}); 
    }   
});
    
    });

app.get("/customListName", function(req, res){
    const customListName=req.params.customListName;
});

app.post("/", function(req, res){
    // var item=req.body.newItem;
    // if(req.body.list==="work"){
    //     workItems.push(item);
    //     res.redirect("/work");
    // }else{
    //     items.push(item);
    //     res.redirect("/");
    // }
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        name: itemName
    });
    
    if(listName == "Today"){
        item.save();
        res.redirect("/");    
    }else{
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        });
    }
    
});

app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId, function(err){
            if(!err){
                console.log("successfully deleted checked item.");
                res.redirect("/");
            }
        });  
    }else{
        List.findOneAndUpdate({name:listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
            if(!err){
                res.redirect("/"+listName);
            }
        });
        
    }
   
});

app.get("/:customListName", function(req, res){
    const customListName = _.capitalize(req.params.customListName);
    
List.findOne({name: customListName}, function(err, foundList){
    if(!err){
        if(!foundList){
            //create a new list
            const list =new List({
                name : customListName,
                items : defaultItems
            });
            list.save();
            res.redirect("/" + customListName);
        }else{
            //show existimg list
            res.render("list", {listTitle: foundList.name, newlistItems: foundList.items})
        }
    }
});

   
});

// app.get("/work", function(req, res){
//     res.render("list", {listTitle: "work", newlistItems: workItems});
// });
app.get("/about", function(req, res){
    res.render("about");
});
app.listen(8000, function(){
    console.log("Server running at port 8000");
});
