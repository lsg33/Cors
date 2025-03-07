const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors'); 
const port = 3000;

mongoose.connect('mongodb+srv://forcesspecial801:oCqg7zZg0MA95I5b@cluster777.atoevuq.mongodb.net/NT', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB:', err));

const userSchema = new mongoose.Schema({
  username: String,
  displayName: String,
  friends: Number,
  tags: Number,
  playtime: Number,
  tagratio: Number,
  image: String,
  online: Boolean,
    friendList: [{
        type: mongoose.Schema.Types.ObjectId,
    }]
});

const productSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    productID: String,
    reviews: [{  
        reviewer: String,
        reviewText: String
    }]
});

const Product = mongoose.model('Product', productSchema, 'Products');

const User = mongoose.model('User', userSchema);

app.use(express.static('public')); 

app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

app.use(cors({
  origin: 'https://novatag.lol', 
}));


app.use(express.json()); 


app.get('/user', async (req, res) => {
    const username = req.query.username;
    console.log('Request received for username:', req.query.username);

    if (!username) {
      console.log('username required');
        return res.status(400).json({ error: 'Username is required' });
    }

    try {
        const user = await User.findOne({ username });

        if (user) {
            res.json(user);
            console.log('Sending JSON:', user);
        } else {
            res.status(404).json({ error: 'User not found' });
            console.log('user not found');
        }
    } catch (err) {
        res.status(500).json({ error: 'Error fetching user data' });
        console.log('error fetching data');
    }
});

// Route to fetch user data
app.get('/friendss', async (req, res) => {
    const ids = req.query.id;
    console.log('Request received for username:', req.query.id);

    try {
         const user = await User.findById(ids);
         res.json(user);
         console.log('Sending JSON:', user);
        
    } catch (err) {
        res.status(500).json({ error: 'Error fetching user data' });
        console.log('error fetching data');
    }
});

app.get('/product', async (req, res) => {
    const productID = req.query.productID; 
    
    console.log('Request received for productID:', productID);

    if (!productID) {
        console.log('productID required');
        return res.status(400).json({ error: 'Product ID is required' });
    }

    try {
        const product = await Product.findOne({ productID: productID });

        if (product) {
            res.json(product);
            console.log('Sending JSON:', product);
        } else {
            res.status(404).json({ error: 'Product not found' });
            console.log('Product not found');
        }
    } catch (err) {
        res.status(500).json({ error: 'Error fetching product data' });
        console.log('Error fetching product data');
    }
});

app.get('/products', async (req, res) => {
    try {
        const products = await Product.find(); 
        res.json(products); 
          console.log('Request received for querying products:', products);
        
    } catch (err) {
        res.status(500).json({ error: 'Error fetching product data' });
        console.error('Error fetching product data:', err);
    }
});

app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users); 
    } catch (err) {
        res.status(500).json({ error: 'Error fetching product data' });
        console.error('Error fetching user data:', err);
    }
});



app.post('/addFriend', async (req, res) => {
    const { userId, friendId } = req.body;
    console.log('Request received for adding friend:', friendId, userId);

    try {
        let user = await User.findById(userId);


        if (!user.friendList.includes(friendId)) {
            user.friendList.push(friendId);
            await user.save();
            console.log('Request received! now pushing id');
        }

        res.status(200).json({ message: 'User added successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error adding friend', error });
    }
});

app.get('/checkFriend', async (req, res) => {
    const { username, friendUsername } = req.query; 
    console.log('Request received for checking friend:', username, friendUsername);

    try {
        const user = await User.findOne({ username }).populate('friendList'); 
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        const friend = await User.findOne({ username: friendUsername });
           if (!friend) return res.status(404).json({ message: 'Friend not found' });

        const isFriend = user.friendList.some(f => f.equals(friend._id));

        if (isFriend) {
            res.status(200).json({ message: 'Friend exists in list', isFriend: true });
            console.log('Friend exists in list', username, friendUsername);
        } else {
            res.status(200).json({ message: 'Friend not in list', isFriend: false });
            console.log('Friend not in list', username, + friendUsername);
        }
    } catch (error) {
        console.error('Friend check error', error); 
        res.status(500).json({ message: 'Error checking friend', error });
    }
});

app.post('/updateProfilePic', async (req, res) => {
    const { username, image, newUsername } = req.body;
 
    const user = await User.findOne({ username });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

 
    if (image) {
        user.image = image;
        console.error('new image set');
        await user.save();
    }


    if (newUsername) {
        user.username = newUsername;
      console.error('new user set', newUsername);
        await user.save();
    }

    return res.status(200).json({ message: 'Profile picture updated successfully', user });
});

app.post('/online', async (req, res) => {
    const { username, isOnline } = req.body;

    try {
       
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        
        user.online = isOnline; 
        await user.save();

        res.json({ message: 'User status updated', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
