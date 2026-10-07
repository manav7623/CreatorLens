// Seed script to clean and populate CreatorLens database with fresh realistic @gmail.com accounts
// Command: node seed.js

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { sequelize, initializeDatabase } = require('./config/database');
const setupAssociations = require('./models/associations');
const User = require('./models/User');
const Campaign = require('./models/Campaign');
const Application = require('./models/Application');
const Payment = require('./models/Payment');

async function seed() {
  try {
    console.log('⏳ Connecting to Aiven Cloud MySQL database...');
    await initializeDatabase();
    setupAssociations();

    // Drop and re-create all tables for a completely fresh start
    await sequelize.sync({ force: true });
    console.log('✅ All old data wiped cleanly & fresh tables created.\n');

    // 1. Create Admins
    const admin1 = await User.create({
      name: 'CreatorLens Admin',
      email: 'admin@gmail.com',
      password: 'Admin@12345',
      role: 'admin',
      isVerified: true
    });

    const admin2 = await User.create({
      name: 'Super Admin',
      email: 'creatorlens.admin@gmail.com',
      password: 'Admin@12345',
      role: 'admin',
      isVerified: true
    });
    console.log('👑 Admin Accounts Created:');
    console.log('   - admin@gmail.com / Admin@12345');
    console.log('   - creatorlens.admin@gmail.com / Admin@12345\n');

    // 2. Create Brands (all @gmail.com)
    const brandsData = [
      {
        name: 'TechCorp India',
        email: 'techcorp.india@gmail.com',
        password: 'Brand@12345',
        companyName: 'TechCorp India',
        industry: 'Technology',
        website: 'https://techcorp.in',
        description: 'Leading tech company specializing in productivity apps and AI tools.',
        location: 'Bangalore, India'
      },
      {
        name: 'Nike India',
        email: 'nike.india.brand@gmail.com',
        password: 'Brand@12345',
        companyName: 'Nike India Private Limited',
        industry: 'Sports & Apparel',
        website: 'https://nike.in',
        description: 'Global leader in athletic footwear, premium sports apparel, and accessories.',
        location: 'Mumbai, India'
      },
      {
        name: 'Zomato Marketing',
        email: 'zomato.marketing@gmail.com',
        password: 'Brand@12345',
        companyName: 'Zomato Limited',
        industry: 'Food & Beverage',
        website: 'https://zomato.com',
        description: 'Leading online food delivery and restaurant discovery platform across India.',
        location: 'Gurugram, India'
      },
      {
        name: 'boAt Lifestyle',
        email: 'boat.collab@gmail.com',
        password: 'Brand@12345',
        companyName: 'boAt Lifestyle',
        industry: 'Audio & Wearables',
        website: 'https://boat-lifestyle.com',
        description: 'India fastest-growing audio brand specializing in wireless earphones and smart watches.',
        location: 'New Delhi, India'
      },
      {
        name: 'Apple India',
        email: 'apple.india.collab@gmail.com',
        password: 'Brand@12345',
        companyName: 'Apple India Private Limited',
        industry: 'Consumer Electronics',
        website: 'https://apple.com/in',
        description: 'Designs and manufactures iPhones, iPads, MacBooks, and creative digital tools.',
        location: 'Mumbai, India'
      },
      {
        name: 'Samsung India',
        email: 'samsung.creatorhub@gmail.com',
        password: 'Brand@12345',
        companyName: 'Samsung India Electronics',
        industry: 'Consumer Electronics',
        website: 'https://samsung.com/in',
        description: 'Global leader in smartphones, nightography cameras, and smart displays.',
        location: 'Gurugram, India'
      },
      {
        name: 'Puma India',
        email: 'puma.india.brand@gmail.com',
        password: 'Brand@12345',
        companyName: 'Puma Sports India',
        industry: 'Sports & Lifestyle',
        website: 'https://puma.com',
        description: 'Leading sports brand designing high-performance running shoes and workout wear.',
        location: 'Bangalore, India'
      },
      {
        name: 'Adidas India',
        email: 'adidas.india.collab@gmail.com',
        password: 'Brand@12345',
        companyName: 'Adidas India',
        industry: 'Sports & Lifestyle',
        website: 'https://adidas.co.in',
        description: 'Global sports brand designing iconic athletic footwear, streetwear, and gear.',
        location: 'New Delhi, India'
      },
      {
        name: 'Netflix India',
        email: 'netflix.india.collab@gmail.com',
        password: 'Brand@12345',
        companyName: 'Netflix India',
        industry: 'Entertainment',
        website: 'https://netflix.com',
        description: 'Premier streaming entertainment service delivering movies, series, and viral shows.',
        location: 'Mumbai, India'
      }
    ];

    const createdBrands = [];
    for (const b of brandsData) {
      const brand = await User.create({
        name: b.name,
        email: b.email,
        password: b.password,
        role: 'brand',
        isVerified: true,
        brandProfile: {
          companyName: b.companyName,
          industry: b.industry,
          website: b.website,
          description: b.description,
          location: b.location,
          campaignCount: 3
        }
      });
      createdBrands.push(brand);
    }
    console.log(`🏢 Created ${createdBrands.length} Brand Accounts (@gmail.com)`);

    // 3. Create Creators (all @gmail.com)
    const creatorsData = [
      {
        name: 'Manav Patel',
        email: 'dhameliyamanav@gmail.com',
        password: 'Creator@12345',
        niche: ['Tech', 'Lifestyle'],
        followers: 185000,
        engagement: 5.4,
        aiScore: 92,
        bio: 'Tech enthusiast & digital creator testing the latest smartphones, developer setups, and lifestyle gadgets.'
      },
      {
        name: 'MD Reviews',
        email: 'md.creator.official@gmail.com',
        password: 'Creator@12345',
        niche: ['Tech', 'Gaming'],
        followers: 160000,
        engagement: 4.8,
        aiScore: 88,
        bio: 'Honest gadgets reviews, unboxings, and smartphone comparisons.'
      },
      {
        name: 'Krish Patel',
        email: 'krish.fitness@gmail.com',
        password: 'Creator@12345',
        niche: ['Fitness', 'Lifestyle'],
        followers: 95000,
        engagement: 4.2,
        aiScore: 84,
        bio: 'Fitness coach and wellness creator sharing daily workout routines and diet tips.'
      },
      {
        name: 'Tamanna Sharma',
        email: 'tamanna.fashion@gmail.com',
        password: 'Creator@12345',
        niche: ['Fashion', 'Beauty'],
        followers: 240000,
        engagement: 6.1,
        aiScore: 95,
        bio: 'Fashion stylist sharing seasonal lookbooks, skincare regimens, and trend insights.'
      },
      {
        name: 'Harshita Verma',
        email: 'harshita.travel@gmail.com',
        password: 'Creator@12345',
        niche: ['Travel', 'Food'],
        followers: 130000,
        engagement: 4.9,
        aiScore: 86,
        bio: 'Exploring hidden gems across India, local culinary experiences, and cinematic travel vlogs.'
      },
      {
        name: 'Ravi Kumar',
        email: 'ravi.gaming@gmail.com',
        password: 'Creator@12345',
        niche: ['Gaming', 'Tech'],
        followers: 320000,
        engagement: 6.8,
        aiScore: 94,
        bio: 'Gaming streamer, esports commentator, and PC build enthusiast.'
      },
      {
        name: 'Smit Shah',
        email: 'smit.finance@gmail.com',
        password: 'Creator@12345',
        niche: ['Education', 'Finance'],
        followers: 88000,
        engagement: 5.7,
        aiScore: 89,
        bio: 'Making personal finance, investing, and tech tools simple for young professionals.'
      },
      {
        name: 'Happy Singh',
        email: 'happy.comedy@gmail.com',
        password: 'Creator@12345',
        niche: ['Entertainment', 'Comedy'],
        followers: 410000,
        engagement: 7.6,
        aiScore: 96,
        bio: 'Relatable comedy sketches, viral reels, and hilarious everyday observations.'
      },
      {
        name: 'Hitiksha Dave',
        email: 'hitiksha.design@gmail.com',
        password: 'Creator@12345',
        niche: ['Art', 'Design'],
        followers: 115000,
        engagement: 5.1,
        aiScore: 87,
        bio: 'Digital illustrator and visual designer sharing creative process and speedpaints.'
      }
    ];

    const createdCreators = [];
    for (const c of creatorsData) {
      const creator = await User.create({
        name: c.name,
        email: c.email,
        password: c.password,
        role: 'creator',
        isVerified: true,
        creatorProfile: {
          bio: c.bio,
          niche: c.niche,
          location: 'Mumbai, India',
          totalFollowers: c.followers,
          engagementRate: c.engagement,
          aiScore: c.aiScore,
          fakeFollowerPercentage: Math.floor(Math.random() * 4) + 2,
          contentConsistency: Math.floor(Math.random() * 10) + 88,
          isFeatured: true,
          collaborationCount: Math.floor(Math.random() * 8) + 5,
          socialLinks: {
            instagram: { username: `${c.name.toLowerCase().replace(/ /g, '_')}_official`, followers: Math.floor(c.followers * 0.65), url: 'https://instagram.com' },
            youtube: { username: `${c.name} Official`, subscribers: Math.floor(c.followers * 0.35), url: 'https://youtube.com' }
          },
          rateCard: { postRate: 15000, storyRate: 5000, videoRate: 25000 },
          tags: c.niche.map(n => n.toLowerCase())
        }
      });
      createdCreators.push(creator);
    }
    console.log(`🎨 Created ${createdCreators.length} Creator Accounts (@gmail.com)`);

    // 4. Create Active Campaigns
    const campaignsData = [
      {
        brand: createdBrands[0], // TechCorp
        title: 'Summer AI Productivity App Showcase',
        description: 'Seeking tech and lifestyle creators to review our new AI workspace app. Produce authentic workflow demonstrations and reel shorts.',
        niche: ['Tech', 'Lifestyle'],
        platforms: ['instagram', 'youtube'],
        budget: { min: 25000, max: 80000, currency: 'INR' },
        req: { minFollowers: 10000, minEngagement: 3 },
        del: ['1 YouTube Dedicated Video', '2 Instagram Reels']
      },
      {
        brand: createdBrands[1], // Nike
        title: 'Air Max Streetwear & Marathon Series',
        description: 'Showcase authentic street style combinations and marathon durability featuring the newest Air Max and Zoom runners.',
        niche: ['Fashion', 'Fitness'],
        platforms: ['instagram'],
        budget: { min: 40000, max: 120000, currency: 'INR' },
        req: { minFollowers: 25000, minEngagement: 4 },
        del: ['3 High-energy Reels', '5 Story Mentions']
      },
      {
        brand: createdBrands[2], // Zomato
        title: 'Late-Night Cravings & Zomato Gold Tour',
        description: 'Vloggers and food bloggers to feature our instant late-night delivery speed and top restaurant partners.',
        niche: ['Food', 'Lifestyle'],
        platforms: ['instagram', 'youtube'],
        budget: { min: 20000, max: 65000, currency: 'INR' },
        req: { minFollowers: 15000, minEngagement: 3.5 },
        del: ['1 YouTube Food Vlog', '2 Instagram Reels']
      },
      {
        brand: createdBrands[3], // boAt
        title: 'boAt ANC Wireless Audio Blast Challenge',
        description: 'High-energy audio experience test comparing ambient sound vs active noise cancellation in crowded metros and cafes.',
        niche: ['Tech', 'Entertainment'],
        platforms: ['youtube', 'instagram'],
        budget: { min: 30000, max: 90000, currency: 'INR' },
        req: { minFollowers: 20000, minEngagement: 4 },
        del: ['1 Review Video', '3 Shorts/Reels']
      },
      {
        brand: createdBrands[4], // Apple
        title: 'Shot on iPhone 15 Pro Cinematic Masterclass',
        description: 'Create a cinematic travel or creative montage recorded entirely on the iPhone 15 Pro in ProRes color profile.',
        niche: ['Tech', 'Travel', 'Art'],
        platforms: ['youtube', 'instagram'],
        budget: { min: 60000, max: 180000, currency: 'INR' },
        req: { minFollowers: 40000, minEngagement: 5 },
        del: ['1 Cinematic Vlog', '3 Instagram Reels']
      },
      {
        brand: createdBrands[5], // Samsung
        title: 'Galaxy Nightography Urban Cityscapes',
        description: 'Capture low-light city night scenes and zoom shots illustrating night photography clarity.',
        niche: ['Tech', 'Lifestyle'],
        platforms: ['instagram'],
        budget: { min: 35000, max: 100000, currency: 'INR' },
        req: { minFollowers: 15000, minEngagement: 4 },
        del: ['3 Carousel Posts', '2 Reels']
      },
      {
        brand: createdBrands[6], // Puma
        title: 'Puma Running Club & Gymwear Lookbook',
        description: 'Document weekend community running sessions and high-intensity gym wear styling.',
        niche: ['Fitness', 'Fashion'],
        platforms: ['instagram', 'tiktok'],
        budget: { min: 25000, max: 70000, currency: 'INR' },
        req: { minFollowers: 12000, minEngagement: 3.5 },
        del: ['2 Workout Reels', '4 Stories']
      },
      {
        brand: createdBrands[8], // Netflix
        title: 'Weekend Binge Watchlist & Reaction Vlog',
        description: 'Record authentic, funny reaction vlogs and recommend top must-watch thriller and comedy titles.',
        niche: ['Entertainment', 'Comedy'],
        platforms: ['youtube', 'instagram'],
        budget: { min: 30000, max: 85000, currency: 'INR' },
        req: { minFollowers: 20000, minEngagement: 5 },
        del: ['1 Reaction Video', '2 Reels']
      }
    ];

    const createdCampaigns = [];
    for (const c of campaignsData) {
      const camp = await Campaign.create({
        brandId: c.brand.id,
        title: c.title,
        description: c.description,
        niche: c.niche,
        platforms: c.platforms,
        budget: c.budget,
        requirements: { minFollowers: c.req.minFollowers, minEngagement: c.req.minEngagement, location: ['India'] },
        deliverables: c.del,
        status: 'active',
        views: Math.floor(Math.random() * 250) + 100,
        isBoosted: true,
        tags: c.niche.map(n => n.toLowerCase())
      });
      createdCampaigns.push(camp);
    }
    console.log(`📢 Created ${createdCampaigns.length} Active Campaigns`);

    // 5. Create Applications
    const app1 = await Application.create({
      campaignId: createdCampaigns[0].id,
      creatorId: createdCreators[0].id, // Manav Patel
      brandId: createdBrands[0].id,
      proposal: 'I would love to make an in-depth productivity workflow video demonstrating your AI application in action with high engagement.',
      proposedRate: 45000,
      deliverables: ['1 YouTube Dedicated Video', '2 Instagram Reels'],
      timeline: '10 days',
      status: 'accepted',
      dealAmount: 45000
    });

    const app2 = await Application.create({
      campaignId: createdCampaigns[1].id,
      creatorId: createdCreators[3].id, // Tamanna Sharma
      brandId: createdBrands[1].id,
      proposal: 'I will create high-fashion aesthetic Reels featuring the Air Max collection styled with contemporary streetwear.',
      proposedRate: 50000,
      deliverables: ['3 High-energy Reels', '5 Story Mentions'],
      timeline: '14 days',
      status: 'completed',
      dealAmount: 50000,
      completedAt: new Date()
    });

    const app3 = await Application.create({
      campaignId: createdCampaigns[3].id,
      creatorId: createdCreators[1].id, // MD Reviews
      brandId: createdBrands[3].id,
      proposal: 'I will create an unboxing and audio comparison video testing the ANC in busy public spots.',
      proposedRate: 35000,
      deliverables: ['1 Review Video', '3 Shorts/Reels'],
      timeline: '7 days',
      status: 'accepted',
      dealAmount: 35000
    });
    console.log('📝 Created Sample Applications.');

    // 6. Create Payments
    await Payment.create({
      applicationId: app1.id,
      campaignId: createdCampaigns[0].id,
      brandId: createdBrands[0].id,
      creatorId: createdCreators[0].id,
      amount: 45000,
      platformFee: 4500,
      creatorAmount: 40500,
      status: 'held',
      paymentMethod: { type: 'card', last4: '4242' },
      paidAt: new Date(),
      heldAt: new Date()
    });

    await Payment.create({
      applicationId: app2.id,
      campaignId: createdCampaigns[1].id,
      brandId: createdBrands[1].id,
      creatorId: createdCreators[3].id,
      amount: 50000,
      platformFee: 5000,
      creatorAmount: 45000,
      status: 'released',
      paymentMethod: { type: 'upi', upiId: 'tamanna@okhdfcbank' },
      paidAt: new Date(Date.now() - 86400000 * 3),
      heldAt: new Date(Date.now() - 86400000 * 3),
      releasedAt: new Date()
    });
    console.log('💳 Created Sample Escrow & Released Payments.');

    console.log('\n🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!\n');
    console.log('=====================================================');
    console.log('👑 ADMIN LOGIN CREDENTIALS:');
    console.log('   Email:    admin@gmail.com  (or creatorlens.admin@gmail.com)');
    console.log('   Password: Admin@12345');
    console.log('=====================================================');
    console.log('🏢 BRAND ACCOUNTS (Password: Brand@12345):');
    brandsData.forEach(b => console.log(`   - ${b.email}  (${b.name})`));
    console.log('=====================================================');
    console.log('🎨 CREATOR ACCOUNTS (Password: Creator@12345):');
    creatorsData.forEach(c => console.log(`   - ${c.email}  (${c.name})`));
    console.log('=====================================================');

  } catch (err) {
    console.error('❌ Seeding Error:', err);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

seed();
