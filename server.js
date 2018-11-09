'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var dns = require('dns');
var url = require('url');

require('dotenv');

var cors = require('cors');

var bodyParser = require('body-parser');

var app = express();

var Schema =  mongoose.Schema;

//Schema for the counter of the shorturl
var urlCounter = new Schema({urlCounter: Number});
var Counter = mongoose.model('Counter', urlCounter);

//Schema for storing the original url and the short url
var UrlSchema = new Schema({originalUrl:String, shortUrl: Number});
var Url = mongoose.model('Url',UrlSchema);

//function used to handle the end of a process
function done(error,data,res){
  if (error) return res.send(error);
  res.json({original_url:data.originalUrl, short_url:data.shortUrl});
}



// Method to save Url to db
function saveUrl(postRequestBody,done,res){
  
  
   //using mongoose determine if the url shortener counter has been initiated,
   //if not initiate
   Counter.findOne({},function(error,document){
    
    if (error) return res.send(error);
     
    
    if (document === null)
    {
      
     let y = 1;
      let count = new Counter({urlCounter: y});
      count.save(function(error,data){
        if (error) return res.send(error);
        
        let url = new Url({originalUrl:postRequestBody.url, shortUrl:y});
        url.save(function(error,data){
        if (error) return done(error,null,res);
        done(null,data,res);
  });
      });
      
    }
    
    else
    {
        //increment count by +1 in the db, store that in a variable to be used
        //as a new shorturl. Then update the url in the db
      document.urlCounter = document.urlCounter + 1;
      let y = document.urlCounter;
      document.save(function(error,data){
        if (error) return res.send(error);
      });
      
      let url = new Url({originalUrl:postRequestBody.url, shortUrl:y});
      url.save(function(error,data){
      if (error) return done(error,null,res);
      done(null,data,res);
  });
    }
    
  });
  
}

// Basic Configuration 
var port = process.env.PORT || 3000;


mongoose.connect(process.env.MONGOLAB_URI,{useMongoClient:true});

app.use(cors());

/** this project needs to parse POST bodies **/

app.use(bodyParser.urlencoded({extended:false}));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// First API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.post("/api/shorturl/new",function(req,res){

    //Regular Expression used to check that url is in the right format
  let urlExpression = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gm;
  

  if (req.body.url.match(urlExpression)){
    
  //using builtin url module
  let theUrl = url.parse(req.body.url);
  dns.lookup(theUrl.hostname,function(error,address,family){
    if (!error){
      
      saveUrl(req.body,done,res);
    }
    else{
      res.json({error:"Domain does not exist"});
    }
  });
    

}
  else{
    res.json({error:"Invalid URL!"});
  }
  
});

app.get('/api/shorturl/:shorturl', function(req,res){
  let surl = {shortUrl:req.params.shorturl};
  Url.findOne(surl, function(error,document){
    if (error) return res.json({error:error});
    
    if (document === null) return res.json({error:"Invalid ShortUrl"})
    
    else {
      res.redirect(document.originalUrl);
    }
    
    
  });
  
});

app.listen(port, function () {
  
  console.log('Node.js listening ...');
});
