const { verifyToken, verifyTokenAuthorization, verifyTokenAdmin } = require("./verifyToken")
const CryptoJS = require('crypto-js');
const Order = require("../models/Order");

const router = require("express").Router()


//CREATE
router.post("/", verifyToken, async(req, res) =>{
    const newOrder = new Order(req.body)
   
    try {
        const savedOrder = await newOrder.save();
        res.status(200).json(savedOrder)
    } catch (error) {
        res.status(500).json("not going")
    }
})

//UPDATE
router.put("/:id", verifyTokenAdmin, async(req, res)=>{
    

    try {
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, {
            $set: req.body
        }, {new:true});
        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json(error)
    }
});

//DELETE
router.delete("/:id", verifyTokenAdmin, async(req,res) =>{
    try {
        await Order.findByIdAndDelete(req.params.id)
        res.status(200).json("Order has been deleted...")
    } catch (error) {
        res.status(500).json(error)
    }
})

//GET UseR Orders
router.get("/find/:userId", verifyTokenAuthorization, async(req,res) =>{
    try {
       const orders =  await Order.findOne({userId: req.params.userId})
        res.status(200).json(orders)
    } catch (error) {
        res.status(500).json(error)
    }
});

// //GET ALL 
router.get("/", verifyTokenAdmin, async(req, res) =>{
    try {
        const orders = await Order.find()
        res.status(200).json(orders)
    } catch (error) {
        res.status(500).json(error)
    }
});

//Get Monthly Income
router.get("/income", verifyTokenAdmin, async(req, res)=>{
    const date = new Date();
    const lastMonth = new Date(date.setMonth(date.getMonth() -1));
    const previousMonth = new Date(date.setMonth(lastMonth.getMonth() -1));

    try {
        const income = await Order.aggregate([
            {$match: {createdAt: {$gte: previousMonth}}},
            {
                $project:{
                    month:{$month: "$createdAt"},
                    sales:"$amount",
                },
            },
            {
                $group:{
                    _id:"$month",
                    total:{$sum: "$sales"}
                },
            },
        ])
            
        res.status(200).json(income)
    } catch (error) {
        res.status(500).json(error)
    }
})



module.exports = router