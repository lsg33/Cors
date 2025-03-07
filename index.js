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
  }],
  blockedList: [{
    type: mongoose.Schema.Types.ObjectId, // Stores blocked users' IDs
  }],
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

app.post('/block', async (req, res) => {
  const { userId, blockId } = req.body;
  console.log('Request received for blocking:', blockId, userId);

  try {
    // Find the user and the user to be blocked
    let user = await User.findById(userId);
    let blockUser = await User.findById(blockId);

    // Check if both users exist
    if (!user || !blockUser) {
      return res.status(404).json({ message: 'User or Blocked User not found' });
    }

    // Check if the user has already blocked the other user
    if (!user.blockedList.includes(blockId)) {
      user.blockedList.push(blockId);
      await user.save();
      console.log('User blocked successfully');
    }

    // Optionally: You can also remove the blocked user from the friend list if they were friends
    user.friendList = user.friendList.filter(id => id.toString() !== blockId.toString());
    await user.save();

    res.status(200).json({ message: 'User blocked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error blocking user', error });
    console.log('Error blocking user:', error);
  }
});

app.post('/unblock', async (req, res) => {
  const { userId, blockId } = req.body;
  console.log('Request received for unblocking:', blockId, userId);

  try {
    // Find the user and the user to be unblocked
    let user = await User.findById(userId);

    // Check if both users exist
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user has blocked the other user
    if (user.blockedList.includes(blockId)) {
      user.blockedList = user.blockedList.filter(id => id.toString() !== blockId.toString());
      await user.save();
      console.log('User unblocked successfully');
    }

    res.status(200).json({ message: 'User unblocked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error unblocking user', error });
    console.log('Error unblocking user:', error);
  }
});




app.post('/addFriend', async (req, res) => {
    const { userId, friendId } = req.body;
    console.log('Request received for adding friend:', friendId, userId);

    try {
        // Find the user and friend in the database
        let user = await User.findById(userId);
        let friend = await User.findById(friendId);

        // Check if both user and friend exist
        if (!user || !friend) {
            return res.status(404).json({ message: 'User or Friend not found' });
        }

        // Add the friend's ID to the user's friend list, if it's not already there
        if (!user.friendList.includes(friendId)) {
            user.friendList.push(friendId);
            await user.save(); // Save the updated user object with the new friend ID
            console.log('Friend added successfully');
        }

        res.status(200).json({ message: 'Friend added successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error adding friend', error });
        console.log('Error adding friend:', error);
    }
});


app.post('/removeFriend', async (req, res) => {
    const { userId, friendId } = req.body;
    console.log('Request received for removing friend:', friendId, userId);

    try {
        let user = await User.findById(userId);

        if (user.friendList.includes(friendId)) {
            user.friendList = user.friendList.filter(id => id !== friendId); // Remove the friendId
            await user.save();
            console.log('Updated friend list:', user.friendList);
            console.log('Request received! Now removing id');
        }

        res.status(200).json({ message: 'User removed successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing friend', error });
    }
});


app.get('/checkFriend', async (req, res) => {
  const { username, friendUsername } = req.query; 
  console.log('Request received for checking friend:', username, friendUsername);

  try {
    // Find the user and friend in the database
    const user = await User.findOne({ username }).populate('friendList blockedList');
    const friend = await User.findOne({ username: friendUsername });

    // Check if the users exist
    if (!user || !friend) return res.status(404).json({ message: 'User or Friend not found' });

    // Check if the user has blocked the friend or vice versa
    if (user.blockedList.includes(friend._id) || friend.blockedList.includes(user._id)) {
      return res.status(403).json({ message: 'User is blocked, redirecting...', redirectTo: '/' });
    }

    const isFriend = user.friendList.some(f => f.equals(friend._id));

    if (isFriend) {
      res.status(200).json({ message: 'Friend exists in list', isFriend: true });
      console.log('Friend exists in list', username, friendUsername);
    } else {
      res.status(200).json({ message: 'Friend not in list', isFriend: false });
      console.log('Friend not in list', username, friendUsername);
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
