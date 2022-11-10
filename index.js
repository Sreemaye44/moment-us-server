const express= require('express');
const cors= require('cors');
const jwt = require('jsonwebtoken');

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app =express();
const port=process.env.PORT||5000;

//middle wares
app.use(cors());
app.use(express.json())

// console.log(process.env.DB_USER);
// console.log(process.env.DB_PASSWORD);


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ewurel7.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req,res,next){
    const authHeader=req.headers.authorization;
    if(!authHeader){
     return res.status(401).send({message: 'unauthorized access'})
    }
    const token=authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,function(err, decoded){
     if(err){
       return res.status(401).send({message: 'unauthorized access'})
     }
     req.decoded=decoded;
     next();
    })
}

async function run(){
   try{
      const serviceCollection=client.db('photography').collection('photography-area');
      const reviewCollection=client.db('photography').collection('review-area');

      app.post('/jwt',(req,res)=>{
        const user=req.body;
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{expiresIn: '1h'})
        res.send({token})
      });

      app.get('/services', async(req,res)=>{
           const query=parseInt(req.query?.total == undefined ? 0: req.query?.total );
           const cursor=serviceCollection.find({}).sort({"creationDate":-1}).limit(query);
           const services=await cursor.toArray();
           res.send(services)

      });
      app.get('/allServices',async(req,res)=>{
           const query={};
           const cursor=serviceCollection.find(query);
           const allServices=await cursor.toArray();
           res.send(allServices)

      });

      app.get('/services/:id', async(req,res)=>{
        const id=req.params.id;
        const query={_id:ObjectId(id)}
        const service=await serviceCollection.findOne(query);
        res.send(service);

});
    app.get('/review', async(req,res)=>{
    let query={};
    if(req.query.service){
        query=
        {
            service: req.query.service
        }
    }
    const cursor=reviewCollection.find(query).sort({"creationDate":-1});
        const review=await cursor.toArray();
        res.send(review);
      });
      
    app.get('/myReview',verifyJWT, async(req,res)=>{
        const decoded=req.decoded;
        if(decoded.email!==req.query.email){
          res.status(403).send({message: 'unauthorized access'})
        }
    let query={};
    if(req.query.email){
        query=
        {
            email: req.query.email
        }
    }
    const cursor=reviewCollection.find(query).sort({"creationDate":-1});
        const review=await cursor.toArray();
        res.send(review);
      });

      app.get('/myReview/:id', async(req,res)=>{
        const id=req.params.id;
        const query={_id:ObjectId(id)}
        const service=await reviewCollection.findOne(query);
        res.send(service);

});
    

    app.post('/services', async(req,res)=>{
    const newService=req.body;
    console.log(newService);
    newService.creationDate = new Date();
    const service=await serviceCollection.insertOne(newService);
    res.send(service);

});
   

app.delete('/myReview/:id',async(req,res)=>{
    const id=req.params.id;
    console.log(id);
    const query={_id:ObjectId(id)};
    //console.log(query,id);
    const result=await reviewCollection.deleteOne(query);
    res.send(result);
    

  });

  app.put('/myReview/:id', async(req,res)=>{
    const id= req.params.id;
    console.log(id)
    const filter={_id: ObjectId(id)};
    const review= req.body;
    const option= {upsert: true};
    const updatedReview={
        $set: {
            message: review.message
        }
    }
    const result= await reviewCollection.updateOne(filter, updatedReview, option);
    res.send(result);

})



   }

   finally{

   }
}

run().catch(err=>console.error(err))


app.get('/',(req,res)=>{
    res.send('server is running')
})

app.listen(port, ()=>{
    console.log(`server running on,${port}`)
})