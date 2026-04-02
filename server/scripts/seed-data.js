const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load env from one level up (since this is in /scripts)
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models
const User = require('../models/userModel');
const Post = require('../models/postModel');

const sampleUsers = [
  {
    username: "pac",
    email: "pac@gmail.com",
    password: "Pac*123#",
    full_name: "Pascal",
    bio: "Welcome to IwacuHub! 🇷🇼 Passionate about tech and community building.",
    role: "user"
  },
  {
    username: "john",
    email: "john@gmail.com",
    password: "John*123#",
    full_name: "John Doe",
    bio: "Tech enthusiast from Kigali 🇷🇼 Exploring the digital world.",
    role: "user"
  },
  {
    username: "alice",
    email: "alice@gmail.com",
    password: "Alice*123#",
    full_name: "Alice Smith",
    bio: "Travel lover exploring Rwanda 🌍 Sharing amazing experiences.",
    role: "user"
  },
  {
    username: "rwanda_tourism",
    email: "tourism@rwanda.com",
    password: "Tourism123",
    full_name: "Rwanda Tourism Board",
    bio: "Official Rwanda Tourism account. Discover the land of a thousand hills! 🇷🇼",
    role: "creator",
    verified: true
  },
  {
    username: "kigali_life",
    email: "life@kigali.com",
    password: "Kigali123",
    full_name: "Kigali Life",
    bio: "Everything about Kigali city! Events, news, and culture. 🏙️",
    role: "creator",
    verified: true
  },
  {
    username: "gorilla_trek",
    email: "gorilla@volcanoes.com",
    password: "Gorilla123",
    full_name: "Gorilla Trekking Rwanda",
    bio: "Experience the majestic mountain gorillas in their natural habitat. 🦍",
    role: "creator",
    verified: true
  },
  {
    username: "rwanda_coffee",
    email: "coffee@rwanda.com",
    password: "Coffee123",
    full_name: "Rwandan Coffee",
    bio: "Discover the finest Arabica coffee from Rwanda. ☕",
    role: "creator",
    verified: true
  }
];

const samplePosts = [
  {
    content: "Welcome to IwacuHub! 🇷🇼 Discover the best of Rwanda's digital community. Share your stories, connect with others, and explore the beauty of Rwanda!",
    hashtags: ["iwacuhub", "rwanda", "welcome", "community"],
    location: "Kigali, Rwanda"
  },
  {
    content: "Kigali is officially the cleanest city in Africa! 🏙️✨ Let's keep it that way. #KigaliCity #CleanCity #Rwanda",
    hashtags: ["KigaliCity", "CleanCity", "Rwanda", "VisitRwanda"],
    location: "Kigali, Rwanda"
  },
  {
    content: "Did you know? Rwanda is home to over 1,000 mountain gorillas - half of the world's population! 🦍 Protect our wildlife. #GorillaTrekking #Conservation #Rwanda",
    hashtags: ["GorillaTrekking", "Conservation", "Rwanda", "Wildlife"],
    location: "Volcanoes National Park"
  },
  {
    content: "Our coffee is recognized as some of the finest in the world! ☕ Rich, smooth, and full of flavor. Try Rwandan coffee today! #RwandanCoffee #CoffeeLover #MadeInRwanda",
    hashtags: ["RwandanCoffee", "CoffeeLover", "MadeInRwanda", "Rwanda"],
    location: "Kigali, Rwanda"
  },
  {
    content: "Lake Kivu is one of Africa's Great Lakes and offers stunning scenery. Perfect for weekend getaways! 🌊 #LakeKivu #TravelRwanda #Nature",
    hashtags: ["LakeKivu", "TravelRwanda", "Nature", "Rwanda"],
    location: "Lake Kivu"
  },
  {
    content: "Umuganda is a beautiful Rwandan tradition of community work. Every last Saturday of the month, Rwandans come together to improve their communities. 🇷🇼 #Umuganda #Rwanda #Community",
    hashtags: ["Umuganda", "Rwanda", "Community", "Tradition"],
    location: "All across Rwanda"
  },
  {
    content: "Nyungwe Forest National Park offers a breathtaking canopy walkway. Experience the rainforest from above! 🌿 #Nyungwe #Adventure #Rwanda",
    hashtags: ["Nyungwe", "Adventure", "Rwanda", "CanopyWalk"],
    location: "Nyungwe Forest"
  },
  {
    content: "Enjoying a beautiful sunset in Kigali. The city has so much to offer! 🌅 #KigaliLife #Sunset #Rwanda",
    hashtags: ["KigaliLife", "Sunset", "Rwanda", "KigaliCity"],
    location: "Kigali, Rwanda"
  },
  {
    content: "Akagera National Park is home to the Big Five! Lion, leopard, elephant, rhino, and buffalo. 🦁🐘🦏 #Akagera #Safari #Wildlife",
    hashtags: ["Akagera", "Safari", "Wildlife", "Rwanda"],
    location: "Akagera National Park"
  },
  {
    content: "Celebrating Rwanda's rich culture and heritage. Our traditions make us unique! 🥁 #RwandaCulture #Heritage #ProudRwandan",
    hashtags: ["RwandaCulture", "Heritage", "ProudRwandan", "Rwanda"],
    location: "Kigali, Rwanda"
  }
];

async function seedData() {
  try {
    if (!process.env.MONGODB_URI) {
       throw new Error("MONGODB_URI is not defined in .env file");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    console.log('✅ Cleared existing data');

    // 2. IMPORTANT: DROP problematic indexes
    try {
        await Post.collection.dropIndexes();
        console.log('✅ Dropped old text indexes to prevent array errors');
    } catch (e) {
        console.log('💡 No existing indexes to drop');
    }

    // 3. Hash passwords and create users
    const salt = await bcrypt.genSalt(10);
    const createdUsers = [];
    
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      const user = new User({
        ...userData,
        password: hashedPassword,
        created_at: new Date()
      });
      await user.save();
      createdUsers.push(user);
      console.log(`✅ Created user: ${user.username}`);
    }

    // 4. Create posts with links to random users
    for (let i = 0; i < samplePosts.length; i++) {
      const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      
      const post = new Post({
        user: randomUser._id,
        content: samplePosts[i].content,
        hashtags: samplePosts[i].hashtags,
        location: samplePosts[i].location,
        visibility: 'public',
        created_at: new Date()
      });
      
      await post.save();
      
      // Update the user's post count (if field exists in your User model)
      if (randomUser.posts_count !== undefined) {
          await User.findByIdAndUpdate(randomUser._id, { $inc: { posts_count: 1 } });
      }
      
      console.log(`✅ Created post ${i + 1}: ${samplePosts[i].content.substring(0, 30)}...`);
    }

    console.log('\n🎉 Data seeding completed successfully!');
    console.log(`📊 Stats: ${createdUsers.length} Users, ${samplePosts.length} Posts created.`);
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedData();