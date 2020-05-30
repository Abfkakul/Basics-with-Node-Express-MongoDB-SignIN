var express=require("express");
var app=express();
var bodyParser=require("body-parser");
var mongoose=require("mongoose");
var passport=require("passport");
var passportLocalMongoose=require("passport-local-mongoose");
var LocalStrategy=require("passport-local");
const bcrypt = require('bcrypt');
const session=require("express-session");

app.use(require("express-session")({
  secret:"my name is khan",
  resave:false,
  saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));
//first db part 1
mongoose.connect("mongodb://localhost/user_app");
//second db part1
//mongoose.connect("mongodb://localhost/world");
app.use(bodyParser.urlencoded({extended: true}));

//session code (disable cache[disable back button])
// server.use(function(req, res, next) {
//   res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
//   next();
// });
app.use(function(req, res, next) {
    if (!req.user)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});

//first db part 2
var userSchema= new mongoose.Schema({
    fName: String,
    lName: String,
    age:   Number,
    sex:   String,
    country: String,
    email: String,
    password: String
});

//second db part 2
var worldSchema= new mongoose.Schema({
   country:String,
});

//session variable
var sess;


//use less, I guess.
userSchema.plugin(passportLocalMongoose);

//first db part3 
var User=mongoose.model("User",userSchema);
//second db part 3
var Spot=mongoose.model("Spot",worldSchema);


passport.use(new LocalStrategy(User.authenticate()));
//to encode and decode session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//first db part 4
User.create;
//second db part 4
Spot.create;

//for second db, I`ll add values from backend.
//but for once we have to run the code below
// var data2= new Spot({
//   country:"China",
// });

// data2.save(function(err,spot){
//    if(err){
//       console.log(err);
//    }
//     else{
//        console.log("Place added");
//        console.log(spot);
//     }
// });


// var data= new User({
//   fName:    "Anas",
//    lName:    "faisal",
//    age:      "22",
//    sex:      "male",
//    email:    "kool@gmail.com",
//    password: "1234" 
// });

// data.save(function(err,user){
//    if(err){
//       console.log(err);
//    }
//     else{
//        console.log("User added");
//        console.log(user);
//     }
// });



//SignIn route
app.get("/",function(req,res){
  //session Connected
  sess=req.session;
  console.log(sess);
  if(sess.email){
    res.redirect("/success");

  }
  else{
    res.render("login.ejs");
  }
  
  //session code end

  //code before session 
  //res.render("login.ejs");

});

//newcode
app.post("/",function(req,res){
  //session code part one
  sess=req.session;
  //end

  console.log(req.body);

  var in_email=req.body.id;
  var in_password=req.body.psw;
  var hash;
 
//bcyrpt
User.find({email:in_email},function(err,alldb){
     if(err){
      console.log(err);
     }

    else{
      var len=alldb.length;
      if(len==1){
        hash=alldb[0].password;
        bcrypt.compare(in_password,hash, function(err, result) {
          if(result) {
             // Passwords match
            console.log(in_password);
            console.log(hash);
            console.log("correct");
            //session code part2
            sess.email=req.body.id;
            res.redirect("/success");
            //end

            //code before session
            //res.render("success.ejs",{data:alldb});
          } 
          else {
            // Passwords don't match
            console.log(in_password);
            console.log(hash);
            console.log("Incorrect password, try again..");
            res.redirect("/invalid");  
          } 

        });

      }
      else{
        console.log("You do not have an account, register first..");
        res.redirect("/noaccount")

      }

    }

});

//end bcrypt


    // User.find({email:in_email,password:in_password},function(err,alldb){
    //  if(err){
    //   console.log(err);
    //  }
    //  else{
    //   console.log("correct");
    //   console.log(alldb);

    //   console.log(alldb.length);
    //   var len=alldb.length;
    //   //console.log(alldb[0].email);

    //   if(len==1){
    //     console.log("Login success");
    //     res.render("success.ejs",{data:alldb});  
    //   }

    //   else{
    //     if(len>1){
    //       console.log("Multiple accounts");
    //       res.render("multi.ejs")
    //       //res.render("login.ejs"); 
    //     }
    //     else{
    //       console.log("Create account or invalid credentials");
    //       res.render("invalid.ejs"); 
    //     }
    //   }
      
    //  }
    // });


});

//app.post("/",passport.authenticate("local",{
//  alert("Im in local");
//  successRedirect:"/success",
//  failureRedirect:"/signup"

//}),function(req,res){
    
//});

 
//signUp route
app.get("/signup",function(req,res){
  sess=req.session;
  if(sess.email){
    res.redirect("/success");

  }
  else{
    //new code
    //sign up form countries
    Spot.find({},function(err,alldb){
      if(err){
       console.log(err);
      }
    
    else{
       res.render("signup.ejs",{data:alldb});

      }

    }); 

    
  }

   
});

app.post("/signup",function(req,res){
   
   var fname=req.body.fname;
   var lname=req.body.lname;
   var age=req.body.quantity;
   var sex=req.body.sex;
   var email=req.body.email;
   var psw=req.body.psw;
   var country=req.body.country;
   
   

   //new code for restricting multiple accounts
   User.find({email:email},function(err,alldb){
     if(err){
      console.log(err);
     }

     else{

      var len=alldb.length;
      //bcrypt code(hashing)
      if(len==0){
        bcrypt.hash(psw, 10, function(err, hash) {
          // Store hash in database
          if(err){
            console.log(err);
          }
          else{
            //console.log(hash);
            var newUser={fName:fname, lName:lname, age:age, sex:sex, country:country, email:email,password:hash};
            User.create(newUser,function(err,newlyCreated){
              if(err){
                console.log(err);
              }
              else{
                console.log(newUser);
                res.redirect("/");
              }

            });

          }

        });

      }
      //end bcrypt

      else{
        console.log("Use another email..")
        res.redirect("/multi");

      }
     
     }
 
   });


   //bcrypt code(hashing)
   
   

   
   //end bcrypt




});

app.get("/logout",function(req,res){
  //session code
  req.session.destroy((err)=>{
    if(err){
      console.log(err);
    }
    res.redirect("/");
  });
  //end

});



app.get("/success",function(req,res){
  //session code
  var id;
  var len;
  sess=req.session;
  if(sess.email){
    console.log("You are logged in.");
    console.log(sess);
    id=sess.email;
    console.log(id);
    User.find({email:id},function(err,alldb){
     if(err){
      console.log(err);
     }

    else{
      res.render("success.ejs",{data:alldb});
    }

    });
    
  }
  else{
    console.log("Login First");
    res.redirect("/");
  }
  //end

  
});

app.get("/invalid",function(req,res){
  sess=req.session;
  if(sess.email){
    res.redirect("/success");

  }
  else{
    res.render("invalid.ejs"); 
  }
   
});

app.get("/noaccount",function(req,res){
   sess=req.session;
  if(sess.email){
    res.redirect("/success");

  }
  else{
    res.render("noaccount.ejs"); 
  } 
});

app.get("/multi",function(req,res){
   sess=req.session;
  if(sess.email){
    res.redirect("/success");

  }
  else{
    res.render("multi.ejs"); 
  }
});

app.listen(3007,function(){
   console.log("Server Connected");
})
