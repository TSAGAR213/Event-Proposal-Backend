
const express = require('express');
const mongoose = require('mongoose');
const vendors = require('../Models/vendor')
const User = require('../Models/User')
const cloudinary=require('cloudinary').v2;
const bcrypt = require('bcrypt'); 
const saltRounds = 10;
const { body, validationResult } = require("express-validator");
var jwt = require("jsonwebtoken");
const propmodel = require("../Models/Proposals");
let router = express.Router();
const multer = require("multer");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

require("dotenv").config();


function Verifying(req,res,next){
  jwt.verify(req.headers.authorization,process.env.SECRET_CODE,function(err, decoded) {
    req.vendorid=decoded.data['_id']
    req.name=decoded.data['name']
    req.email=decoded.data['email']
    next()
  });

}

const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: fileStorageEngine });

cloudinary.config({
  cloud_name: "dz6szmrzx",
  api_key: "946256717551921",
  api_secret: process.env.CLOUDINARY,
});

router.post("/createProposal", upload.single("Images"),Verifying,(req, res) => {
  if (req.body) {
    let {
      Event_Name,
      Place_of_event,
      Proposal_type,
      Event_type,
      From_date,
      To_date,
      Description,
      Budget,
      Food_preferances,
      Events,
    } = req.body;

    cloudinary.uploader
      .upload(req.file.path)
      .then((image) => {
        let new_proposal = new propmodel({
          Event_Name,
          Place_of_event,
          Proposal_type,
          Event_type,
          From_date,
          To_date,
          Description,
          Budget,
          Images: [image.url],
          Food_preferances,
          Events,
          Vendor_id:req.vendorid,
          Vendor_name:req.name,
          Vendor_email:req.email
        });

        new_proposal
          .save()
          .then((data) => {
            res.status(201).json(data);
          })
          .catch((e) => {
            res.status(400).json({ message: e.message });
          });
      })
      .catch((e) => {
        res.json({ message: e.message });
      });
  } else {
    res.json({ message: "Please Enter all the details" });
  }
});

router.get("/getproposal", (req, res) => {
  propmodel
    .find()
    .then((data) => {
      res.json({ data });
    })
    .catch((e) => {
      res.json({ message: e.message });
    });
});

router.get("/getproposal/:id", (req, res) => {
  propmodel
    .findById(req.params["id"])
    .then((data) => {
      res.json({ data });
    })
    .catch((e) => {
      res.json({ message: e.message });
    });
});

router.put("/updateproposal/:id", upload.single("Images"), (req, res) => {
  let {
    Event_Name,
    Place_of_event,
    Proposal_type,
    Event_type,
    From_date,
    To_date,
    Description,
    Budget,
    Food_preferances,
    Events,
  } = req.body;

  cloudinary.uploader
    .upload(req.file.path)
    .then((image) => {
      propmodel
        .findByIdAndUpdate(req.params["id"], {
          Event_Name,
          Place_of_event,
          Proposal_type,
          Event_type,
          From_date,
          To_date,
          Description,
          Budget,
          Images: [image.url],
          Food_preferances,
          Events,
        })
        .then((data) => {
          res.json({ data });
        })
        .catch((e) => {
          res.json({ message: e.message });
        });
    })
    .catch((e) => {
      res.json({ message: e.message });
    });
});

router.delete("/deleteproposal/:id", (req, res) => {
  propmodel
    .findByIdAndDelete(req.params["id"])
    .then((data) => {
      res.json({ message: "Propsal deleted", data });
    })
    .catch((e) => {
      res.json({ message: e.message });
    });
});


// vendor login
router.post("/vendorlogin",
    async (req, res) => {
        try {
            const { email, password } = req.body;
            console.log(req.body,"req.body")
            let user_data , userPassword ;

                user_data = await vendors.findOne({  email }) 
                console.log(user_data,"userdata")
                if (user_data===null) {
                    console.log("userdata")
                    return res.status(409).send("User does not exists")
                } 
                userPassword = user_data.password

            bcrypt.compare(password, userPassword, function (err, result) {
                // result == true
                console.log(password,userPassword)
                if (result) {
                    console.log(result,"result")
                    const token = jwt.sign({
                        data: user_data 
                    }, process.env.SECRET_CODE);
                    return res.json({token,userdata:user_data})
                }
                else{
                    console.log(err,"err")
                    return res.send("password not matching")
                }
            })
            
        } catch (e) {
            console.log(e.message)
            res.sendStatus(400)
        }
    })

    //vendor register
    router.post("/vendorregister",
    body('email').isEmail(),
    body('contact').isLength({min:10, max:10}),
    async (req,res)=>{
        try{
            console.log("REGISTER")
            console.log(req.body,"req.body")
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).send(errors.array());
            }

            console.log(errors,"errors")
            const { name,email, password,contact } = req.body;
    
            let vendor_data = await vendors.findOne({ email })
            let vendor_contact = await vendors.findOne({contact})
            console.log(vendor_contact,vendor_data,"vendor details")
            if (vendor_data) {
                console.log("email")
                return res.status(409).send("User already exists with that email please login")
            }
            if(vendor_contact){
                console.log("contact")
                return res.status(409).send("User already exists with that contact please login")
            }
            bcrypt.hash(password, saltRounds, async function (err, hash) {
                // Store hash in your password DB.
                if (err) {
                    return res.sendStatus(400).send(err.message)
                }
    
                let vendor = await vendors.create({
                    name:name,
                    contact:contact,
                    email: email,
                    password: hash
                })
                res.send(vendor)
    
            })
        } catch (e) {
            console.log(e)
            res.sendStatus(400).send(e.message)
        }
    })

router.post("/logout", async (req, res) => {
  token = "";
  res.status(200).send("loggedout successfully");
});

// for creating a new user
router.post("/createuser", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const securePassword = await bcrypt.hash(req.body.password, salt);

        await User.create({
            name: req.body.name,
            email: req.body.email,
            contact: req.body.contact,
            password: securePassword
        })
        console.log("create user")
        res.json({ success: true })
    } catch (error) {
        console.log(error)
        res.sendStatus(400)
    }
});

// login for existing user

router.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const contact = req.body.contact;
  try {
    let userdata;
    if (email) {
      userdata = await User.findOne({ email });
      if (!userdata) {
        return res.status(400).json({ error: "User does not exist" });
      }
    } else {
      userdata = await User.findOne({ contact });
      if (!userdata) {
        return res.status(400).json({ error: "User does not exist" });
      }
    }

    const pwdCompare = bcrypt.compareSync(password, userdata.password);

        if (!pwdCompare) {
            return res.send("password not matching");
        }

    const data = {
      user: {
        id: userdata.id,
      },
    };

        const authToken = jwt.sign(data, process.env.SECRET_CODE)
        return res.json({ success: true, authToken ,userdata})
    } catch (error) {
        console.log(error)
        res.json({ message: error.message })
    }
})


module.exports = router;
