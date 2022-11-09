const express= require('express');
const cors= require('cors');

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
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
   try{
      const serviceCollection=client.db('photography').collection('photography-area');
      const reviewCollection=client.db('photography').collection('review-area');

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
      
    app.get('/myReview', async(req,res)=>{
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
    

    app.post('/services', async(req,res)=>{
    const newService=req.body;
    newService.creationDate = new Date();
    const service=await serviceCollection.insertOne(newService);
    res.send(service);

});
    app.post('/review', async(req,res)=>{
    const newReview=req.body;
    newReview.creationDate = new Date();
    const review=await reviewCollection.insertOne(newReview);
    res.send(review);

});

app.delete('/myReview/:id',async(req,res)=>{
    const id=req.params.id;
    console.log(id);
    const query={_id:ObjectId(id)};
    //console.log(query,id);
    const result=await reviewCollection.deleteOne(query);
    res.send(result);
    

  });



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