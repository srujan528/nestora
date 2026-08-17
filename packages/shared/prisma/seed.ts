import {
  PrismaClient,
  Role,
  GenderRestriction,
  RoomType,
  FoodType,
  MealOption,
  PhotoCategory,
  ListingStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log('🧹 Cleaning existing database records...');

  await prisma.inquiry.deleteMany();
  await prisma.review.deleteMany();
  await prisma.savedPG.deleteMany();
  await prisma.weeklyMenu.deleteMany();
  await prisma.pGAmenity.deleteMany();
  await prisma.pGPhoto.deleteMany();
  await prisma.room.deleteMany();
  await prisma.pGListing.deleteMany();
  await prisma.hostel.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.college.deleteMany();
  await prisma.userSession.deleteMany();
  await prisma.user.deleteMany();

  console.log('✨ Database cleaned successfully.');
}

async function main() {
  try {
    await cleanDatabase();

    console.log('🌱 Seeding PGFinder (Nestora) demo database...');

    // 1. Create Demo Users
    const ownerRamesh = await prisma.user.create({
      data: {
        email: 'ramesh.owner@nestora.demo',
        password: '$2b$10$3DRXYQE6jNZil2c0alL.SOqA3byN5aUBP2lQpWTJg2G7IcLWQd6yO',
        name: 'Ramesh Sharma (Demo Owner)',
        phone: '+919876543210',
        role: Role.OWNER,
        emailVerified: true,
        phoneVerified: true,
      },
    });

    const ownerSunita = await prisma.user.create({
      data: {
        email: 'sunita.owner@nestora.demo',
        password: '$2b$10$3DRXYQE6jNZil2c0alL.SOqA3byN5aUBP2lQpWTJg2G7IcLWQd6yO',
        name: 'Sunita Gupta (Demo Owner)',
        phone: '+919876543211',
        role: Role.OWNER,
        emailVerified: true,
        phoneVerified: true,
      },
    });

    const studentAarav = await prisma.user.create({
      data: {
        email: 'aarav.student@nestora.demo',
        password: '$2b$10$3DRXYQE6jNZil2c0alL.SOqA3byN5aUBP2lQpWTJg2G7IcLWQd6yO',
        name: 'Rasal Tech Vlog (Student Resident)',
        phone: '+919876543212',
        role: Role.STUDENT,
        emailVerified: true,
        phoneVerified: true,
      },
    });

    const studentHotGaming = await prisma.user.create({
      data: {
        email: 'hotgaming.student@nestora.demo',
        password: '$2b$10$3DRXYQE6jNZil2c0alL.SOqA3byN5aUBP2lQpWTJg2G7IcLWQd6yO',
        name: 'Hot Gaming (Student Resident)',
        phone: '+919876543214',
        role: Role.STUDENT,
        emailVerified: true,
        phoneVerified: true,
      },
    });

    const studentFxzen = await prisma.user.create({
      data: {
        email: 'fxzen.student@nestora.demo',
        password: '$2b$10$3DRXYQE6jNZil2c0alL.SOqA3byN5aUBP2lQpWTJg2G7IcLWQd6yO',
        name: 'Fxzen (Student Resident)',
        phone: '+919876543215',
        role: Role.STUDENT,
        emailVerified: true,
        phoneVerified: true,
      },
    });

    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@nestora.demo',
        password: '$2b$10$3DRXYQE6jNZil2c0alL.SOqA3byN5aUBP2lQpWTJg2G7IcLWQd6yO',
        name: 'System Admin (Nestora)',
        phone: '+919876543213',
        role: Role.ADMIN,
        emailVerified: true,
        phoneVerified: true,
      },
    });

    console.log('✅ Demo Users created.');

    // 2. Create Demo Colleges
    const nmitBangalore = await prisma.college.create({
      data: {
        name: 'Nitte Meenakshi Institute of Technology (NMIT) — Yelahanka',
        shortName: 'NMIT Bangalore',
        city: 'Bengaluru',
        state: 'Karnataka',
        address:
          'P.B. No. 6429, Doddaballapur Road, BSF Campus, Yelahanka, Bengaluru, Karnataka 560064',
        placeId: 'ChIJb0T0Hw0DDTkR8J559_demo_nmit',
        latitude: 13.1294,
        longitude: 77.5879,
        website: 'https://www.nmit.ac.in',
      },
    });

    const duNorth = await prisma.college.create({
      data: {
        name: 'Delhi University — North Campus',
        shortName: 'DU North',
        city: 'New Delhi',
        state: 'Delhi',
        address: 'University Enclave, North Campus, New Delhi, Delhi 110007',
        placeId: 'ChIJb0T0Hw0DDTkR8J559_demo_du',
        latitude: 28.6904,
        longitude: 77.2066,
        website: 'https://du.ac.in',
      },
    });

    const iitBombay = await prisma.college.create({
      data: {
        name: 'IIT Bombay — Powai',
        shortName: 'IIT Bombay',
        city: 'Mumbai',
        state: 'Maharashtra',
        address: 'Main Gate Road, Powai, Mumbai, Maharashtra 400076',
        placeId: 'ChIJb0T0Hw0DDTkR8J559_demo_iitb',
        latitude: 19.1334,
        longitude: 72.9133,
        website: 'https://iitb.ac.in',
      },
    });

    const christUniv = await prisma.college.create({
      data: {
        name: 'Christ University — Koramangala',
        shortName: 'Christ Bengaluru',
        city: 'Bengaluru',
        state: 'Karnataka',
        address: 'Hosur Road, Bhavani Nagar, Koramangala, Bengaluru, Karnataka 560029',
        placeId: 'ChIJb0T0Hw0DDTkR8J559_demo_christ',
        latitude: 12.9344,
        longitude: 77.606,
        website: 'https://christuniversity.in',
      },
    });

    console.log('✅ Demo Colleges created.');

    // High resolution Unsplash Room Photo URLs
    const imgNewport =
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80';
    const imgSalta =
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80';
    const imgVernon =
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&auto=format&fit=crop&q=80';
    const imgIncheon =
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80';
    const imgSalisbury =
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80';
    const imgBathroom =
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80';
    const imgDining =
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80';

    // 3. Create Real PGs near NMIT Bagalur Cross (Exact names & data from Stanza Living screenshots)

    // PG 1: Newport House (Stanza Living)
    const newport = await prisma.pGListing.create({
      data: {
        title: 'Newport House (Stanza Living)',
        ownerId: ownerRamesh.id,
        collegeId: nmitBangalore.id,
        address: 'Bagalur Cross Road, Near NMIT & Reva University, Yelahanka',
        locality: 'Bagalur Cross, Yelahanka',
        city: 'Bengaluru',
        pincode: '560064',
        placeId: 'ChIJb0T0Hw0DDTkR8J559_demo_newport',
        latitude: 13.125,
        longitude: 77.588,
        distanceMeters: 450,
        commuteTimeMins: 5,
        commuteMode: 'WALKING',
        commuteCostEstMonthly: 0,
        commuteFareFormula: 'Walking (₹0/mo)',
        genderRestriction: GenderRestriction.CO_ED,
        curfewTime: '10:30 PM',
        noticePeriodDays: 30,
        houseRules: 'Unisex / Co-ed floors. Biometric entry. Professional housekeeping.',
        minRent: 12299,
        maxRent: 18000,
        securityDeposit: 12299,
        estElectricityMonthly: 900,
        estMaintenanceMonthly: 300,
        foodType: FoodType.NON_VEG_ALLOWED,
        mealOption: MealOption.BREAKFAST_LUNCH_DINNER,
        foodIncludedInRent: true,
        extraFoodCharges: 0,
        averageRating: 4.9,
        reviewCount: 3,
        cleanlinessScore: 5.0,
        foodScore: 4.9,
        wifiScore: 5.0,
        securityScore: 4.9,
        status: ListingStatus.VERIFIED,
        isVerified: true,
        isDemoData: true,
        verificationNotes: 'Verified premium Stanza Living residence near NMIT Bagalur Cross.',
        description:
          'Premium student residency near NMIT & Bagalur Cross. Features modern designer interiors, 300 Mbps Wi-Fi, split AC, room cleaning, and 3 daily meals.',
        publishedAt: new Date(),
        rooms: {
          create: [
            {
              roomType: RoomType.DOUBLE_SHARING,
              monthlyRent: 12299,
              securityDeposit: 12299,
              isAc: true,
              hasAttachedBath: true,
              totalBeds: 10,
              availableBeds: 3,
              description: 'Designer double sharing AC room with ergonomic study workstation.',
            },
          ],
        },
        photos: {
          create: [
            {
              url: imgNewport,
              category: PhotoCategory.ROOM,
              caption: 'Newport House Dining & Common Lounge',
              displayOrder: 1,
            },
            {
              url: imgBathroom,
              category: PhotoCategory.BATHROOM,
              caption: 'Attached Washroom',
              displayOrder: 2,
            },
          ],
        },
        amenities: {
          create: [
            { name: '300 Mbps Fiber Internet', category: 'Comfort', icon: 'wifi' },
            { name: 'Split Air Conditioner', category: 'Comfort', icon: 'wind' },
            { name: 'Attached Washroom', category: 'Comfort', icon: 'home' },
            { name: 'App Service Requests', category: 'Service', icon: 'smartphone' },
          ],
        },
        weeklyMenu: {
          create: {
            monday: JSON.stringify({
              breakfast: 'Masala Dosa',
              lunch: 'South Veg Meals',
              dinner: 'Paneer Butter Masala',
            }),
            tuesday: JSON.stringify({
              breakfast: 'Idli Vada',
              lunch: 'Dal Rice',
              dinner: 'Aloo Gobi & Chapati',
            }),
            wednesday: JSON.stringify({
              breakfast: 'Set Dosa',
              lunch: 'Kadi Chawal',
              dinner: 'Chicken Curry / Shahi Paneer',
            }),
            thursday: JSON.stringify({
              breakfast: 'Poha & Tea',
              lunch: 'Chole Bhature',
              dinner: 'Mix Veg & Dal',
            }),
            friday: JSON.stringify({
              breakfast: 'Puri Saagu',
              lunch: 'Veg Biryani',
              dinner: 'Egg Curry / Matar Paneer',
            }),
            saturday: JSON.stringify({
              breakfast: 'Bisibelebath',
              lunch: 'Rajma Chawal',
              dinner: 'Veg Pulao & Curd',
            }),
            sunday: JSON.stringify({
              breakfast: 'Masala Dosa',
              lunch: 'Chicken Biryani / Veg Thali',
              dinner: 'Light Khichdi',
            }),
          },
        },
      },
    });

    // PG 2: Salta House (Stanza Living)
    const salta = await prisma.pGListing.create({
      data: {
        title: 'Salta House (Stanza Living)',
        ownerId: ownerSunita.id,
        collegeId: nmitBangalore.id,
        address: 'Near Bagalur Cross, Yelahanka',
        locality: 'Bagalur Cross, Yelahanka',
        city: 'Bengaluru',
        pincode: '560064',
        placeId: 'ChIJb0T0Hw0DDTkR8J559_demo_salta',
        latitude: 13.127,
        longitude: 77.5895,
        distanceMeters: 600,
        commuteTimeMins: 7,
        commuteMode: 'WALKING',
        commuteCostEstMonthly: 0,
        commuteFareFormula: 'Walking (₹0/mo)',
        genderRestriction: GenderRestriction.CO_ED,
        curfewTime: '10:30 PM',
        noticePeriodDays: 30,
        houseRules: 'Co-ed floors. Biometric card access. Housekeeping daily.',
        minRent: 9999,
        maxRent: 15000,
        securityDeposit: 9999,
        estElectricityMonthly: 850,
        estMaintenanceMonthly: 250,
        foodType: FoodType.NON_VEG_ALLOWED,
        mealOption: MealOption.BREAKFAST_LUNCH_DINNER,
        foodIncludedInRent: true,
        extraFoodCharges: 0,
        averageRating: 4.8,
        reviewCount: 2,
        cleanlinessScore: 4.9,
        foodScore: 4.7,
        wifiScore: 4.9,
        securityScore: 4.8,
        status: ListingStatus.VERIFIED,
        isVerified: true,
        isDemoData: true,
        verificationNotes: 'Verified Stanza Living co-ed house near NMIT Bagalur Cross.',
        description:
          'Vibrant student house near NMIT Bagalur Cross. Includes high speed internet, attached washrooms, double/triple sharing options, and daily meals.',
        publishedAt: new Date(),
        rooms: {
          create: [
            {
              roomType: RoomType.DOUBLE_SHARING,
              monthlyRent: 9999,
              securityDeposit: 9999,
              isAc: true,
              hasAttachedBath: true,
              totalBeds: 8,
              availableBeds: 4,
              description: 'Double sharing room with study desk and attached bath.',
            },
          ],
        },
        photos: {
          create: [
            {
              url: imgSalta,
              category: PhotoCategory.ROOM,
              caption: 'Salta House Common Dining Area',
              displayOrder: 1,
            },
          ],
        },
        amenities: {
          create: [
            { name: 'High-Speed Wi-Fi', category: 'Comfort', icon: 'wifi' },
            { name: 'Attached Washroom', category: 'Comfort', icon: 'home' },
            { name: 'Biometric Access', category: 'Security', icon: 'lock' },
          ],
        },
        weeklyMenu: {
          create: {
            monday: JSON.stringify({
              breakfast: 'Poha',
              lunch: 'Veg Meals',
              dinner: 'Paneer Masala',
            }),
            tuesday: JSON.stringify({ breakfast: 'Idli', lunch: 'Dal Rice', dinner: 'Aloo Matar' }),
            wednesday: JSON.stringify({
              breakfast: 'Dosa',
              lunch: 'Kadi Chawal',
              dinner: 'Chicken Curry / Paneer',
            }),
            thursday: JSON.stringify({
              breakfast: 'Upma',
              lunch: 'Chole Rice',
              dinner: 'Aloo Paratha',
            }),
            friday: JSON.stringify({
              breakfast: 'Puri Bhaji',
              lunch: 'Dal Fry',
              dinner: 'Special Veg Thali',
            }),
            saturday: JSON.stringify({
              breakfast: 'Uttapam',
              lunch: 'Veg Pulao',
              dinner: 'Dal Tadka',
            }),
            sunday: JSON.stringify({
              breakfast: 'Masala Dosa',
              lunch: 'Special Thali',
              dinner: 'Light Khichdi',
            }),
          },
        },
      },
    });

    // PG 3: Vernon House (Stanza Living)
    const vernon = await prisma.pGListing.create({
      data: {
        title: 'Vernon House (Stanza Living)',
        ownerId: ownerRamesh.id,
        collegeId: nmitBangalore.id,
        address: 'Bagalur Main Road, Yelahanka',
        locality: 'Bagalur Road, Yelahanka',
        city: 'Bengaluru',
        pincode: '560064',
        placeId: 'ChIJb0T0Hw0DDTkR8J559_demo_vernon',
        latitude: 13.131,
        longitude: 77.591,
        distanceMeters: 800,
        commuteTimeMins: 9,
        commuteMode: 'WALKING',
        commuteCostEstMonthly: 0,
        commuteFareFormula: 'Walking (₹0/mo)',
        genderRestriction: GenderRestriction.BOYS,
        curfewTime: '11:00 PM',
        noticePeriodDays: 30,
        houseRules: 'Boys PG. Triple and Quadruple sharing available.',
        minRent: 8399,
        maxRent: 12000,
        securityDeposit: 8399,
        estElectricityMonthly: 800,
        estMaintenanceMonthly: 200,
        foodType: FoodType.NON_VEG_ALLOWED,
        mealOption: MealOption.BREAKFAST_LUNCH_DINNER,
        foodIncludedInRent: true,
        extraFoodCharges: 0,
        averageRating: 4.7,
        reviewCount: 2,
        cleanlinessScore: 4.8,
        foodScore: 4.6,
        wifiScore: 4.9,
        securityScore: 4.7,
        status: ListingStatus.VERIFIED,
        isVerified: true,
        isDemoData: true,
        verificationNotes: 'Verified boys student PG near NMIT Bagalur Road.',
        description:
          'Budget-friendly gents student residence near NMIT campus. Triple & Quadruple sharing rooms, attached washrooms, Wi-Fi, and 3 daily meals.',
        publishedAt: new Date(),
        rooms: {
          create: [
            {
              roomType: RoomType.TRIPLE_SHARING,
              monthlyRent: 8399,
              securityDeposit: 8399,
              isAc: false,
              hasAttachedBath: true,
              totalBeds: 12,
              availableBeds: 5,
              description: 'Triple sharing room with personal study lamps.',
            },
          ],
        },
        photos: {
          create: [
            {
              url: imgVernon,
              category: PhotoCategory.ROOM,
              caption: 'Vernon House Colorful Dining Lounge',
              displayOrder: 1,
            },
          ],
        },
        amenities: {
          create: [
            { name: 'High-Speed Wi-Fi', category: 'Comfort', icon: 'wifi' },
            { name: 'Attached Washroom', category: 'Comfort', icon: 'home' },
          ],
        },
        weeklyMenu: {
          create: {
            monday: JSON.stringify({
              breakfast: 'Poha',
              lunch: 'South Veg Meals',
              dinner: 'Paneer Tikka',
            }),
            tuesday: JSON.stringify({ breakfast: 'Dosa', lunch: 'Dal Rice', dinner: 'Aloo Gobi' }),
            wednesday: JSON.stringify({
              breakfast: 'Idli',
              lunch: 'Rajma Chawal',
              dinner: 'Chicken Masala / Paneer',
            }),
            thursday: JSON.stringify({
              breakfast: 'Upma',
              lunch: 'Kadi Chawal',
              dinner: 'Aloo Matar',
            }),
            friday: JSON.stringify({
              breakfast: 'Puri Saagu',
              lunch: 'Veg Pulao',
              dinner: 'Egg Curry / Paneer',
            }),
            saturday: JSON.stringify({
              breakfast: 'Vada Sambar',
              lunch: 'Dal Fry',
              dinner: 'Veg Biryani',
            }),
            sunday: JSON.stringify({
              breakfast: 'Ghee Dosa',
              lunch: 'Chicken Biryani',
              dinner: 'Light Khichdi',
            }),
          },
        },
      },
    });

    // PG 4: Incheon House (Stanza Living)
    const incheon = await prisma.pGListing.create({
      data: {
        title: 'Incheon House (Stanza Living)',
        ownerId: ownerRamesh.id,
        collegeId: nmitBangalore.id,
        address: 'Near NMIT & Bagalur Cross, Yelahanka',
        locality: 'Bagalur Cross, Yelahanka',
        city: 'Bengaluru',
        pincode: '560064',
        placeId: 'ChIJb0T0Hw0DDTkR8J559_demo_incheon',
        latitude: 13.128,
        longitude: 77.586,
        distanceMeters: 500,
        commuteTimeMins: 6,
        commuteMode: 'WALKING',
        commuteCostEstMonthly: 0,
        commuteFareFormula: 'Walking (₹0/mo)',
        genderRestriction: GenderRestriction.BOYS,
        curfewTime: '11:00 PM',
        noticePeriodDays: 30,
        houseRules: 'Boys PG. Modern study lounge and green outdoor terrace.',
        minRent: 8499,
        maxRent: 13000,
        securityDeposit: 8499,
        estElectricityMonthly: 800,
        estMaintenanceMonthly: 200,
        foodType: FoodType.NON_VEG_ALLOWED,
        mealOption: MealOption.BREAKFAST_LUNCH_DINNER,
        foodIncludedInRent: true,
        extraFoodCharges: 0,
        averageRating: 4.8,
        reviewCount: 1,
        cleanlinessScore: 4.9,
        foodScore: 4.7,
        wifiScore: 4.9,
        securityScore: 4.8,
        status: ListingStatus.VERIFIED,
        isVerified: true,
        isDemoData: true,
        verificationNotes: 'Verified boys PG near NMIT Bagalur Cross.',
        description:
          'Modern boys PG near NMIT. Features attached washrooms, high speed Wi-Fi, games zone, and 3 daily meals.',
        publishedAt: new Date(),
        rooms: {
          create: [
            {
              roomType: RoomType.DOUBLE_SHARING,
              monthlyRent: 8499,
              securityDeposit: 8499,
              isAc: true,
              hasAttachedBath: true,
              totalBeds: 8,
              availableBeds: 2,
              description: 'Double sharing AC room with study tables.',
            },
          ],
        },
        photos: {
          create: [
            {
              url: imgIncheon,
              category: PhotoCategory.ROOM,
              caption: 'Incheon House Green Study Area',
              displayOrder: 1,
            },
          ],
        },
        amenities: {
          create: [
            { name: 'High-Speed Wi-Fi', category: 'Comfort', icon: 'wifi' },
            { name: 'Attached Washroom', category: 'Comfort', icon: 'home' },
          ],
        },
        weeklyMenu: {
          create: {
            monday: JSON.stringify({
              breakfast: 'Poha',
              lunch: 'Veg Meals',
              dinner: 'Paneer Butter Masala',
            }),
            tuesday: JSON.stringify({ breakfast: 'Idli', lunch: 'Dal Rice', dinner: 'Mix Veg' }),
            wednesday: JSON.stringify({
              breakfast: 'Dosa',
              lunch: 'Kadi Chawal',
              dinner: 'Chicken Curry',
            }),
            thursday: JSON.stringify({
              breakfast: 'Upma',
              lunch: 'Chole Rice',
              dinner: 'Aloo Paratha',
            }),
            friday: JSON.stringify({
              breakfast: 'Puri Bhaji',
              lunch: 'Dal Fry',
              dinner: 'Special Veg Thali',
            }),
            saturday: JSON.stringify({
              breakfast: 'Uttapam',
              lunch: 'Veg Pulao',
              dinner: 'Dal Tadka',
            }),
            sunday: JSON.stringify({
              breakfast: 'Masala Dosa',
              lunch: 'Special Thali',
              dinner: 'Light Khichdi',
            }),
          },
        },
      },
    });

    // PG 5: Salisbury House (Stanza Living)
    const salisbury = await prisma.pGListing.create({
      data: {
        title: 'Salisbury House (Stanza Living)',
        ownerId: ownerSunita.id,
        collegeId: nmitBangalore.id,
        address: 'Bagalur Road, Near NMIT & Kristu Jayanti, Yelahanka',
        locality: 'Bagalur Road, Yelahanka',
        city: 'Bengaluru',
        pincode: '560064',
        placeId: 'ChIJb0T0Hw0DDTkR8J559_demo_salisbury',
        latitude: 13.123,
        longitude: 77.585,
        distanceMeters: 950,
        commuteTimeMins: 11,
        commuteMode: 'WALKING',
        commuteCostEstMonthly: 0,
        commuteFareFormula: 'Walking / Short Auto (₹0 - ₹300/mo)',
        genderRestriction: GenderRestriction.BOYS,
        curfewTime: '11:00 PM',
        noticePeriodDays: 30,
        houseRules: 'Boys PG. Professional managed service.',
        minRent: 11499,
        maxRent: 17000,
        securityDeposit: 11499,
        estElectricityMonthly: 850,
        estMaintenanceMonthly: 250,
        foodType: FoodType.NON_VEG_ALLOWED,
        mealOption: MealOption.BREAKFAST_LUNCH_DINNER,
        foodIncludedInRent: true,
        extraFoodCharges: 0,
        averageRating: 4.9,
        reviewCount: 3,
        cleanlinessScore: 5.0,
        foodScore: 4.8,
        wifiScore: 5.0,
        securityScore: 4.9,
        status: ListingStatus.VERIFIED,
        isVerified: true,
        isDemoData: true,
        verificationNotes: 'Verified Salisbury House near NMIT Bagalur Road.',
        description:
          'Premium student PG near NMIT Bagalur Road. Features double/triple sharing AC rooms, attached washroom, laundromat, 300 Mbps Wi-Fi, and daily meals.',
        publishedAt: new Date(),
        rooms: {
          create: [
            {
              roomType: RoomType.DOUBLE_SHARING,
              monthlyRent: 11499,
              securityDeposit: 11499,
              isAc: true,
              hasAttachedBath: true,
              totalBeds: 10,
              availableBeds: 4,
              description: 'Double sharing AC room with study ergonomics.',
            },
          ],
        },
        photos: {
          create: [
            {
              url: imgSalisbury,
              category: PhotoCategory.ROOM,
              caption: 'Salisbury House Modern Dining Area',
              displayOrder: 1,
            },
          ],
        },
        amenities: {
          create: [
            { name: '300 Mbps Wi-Fi', category: 'Comfort', icon: 'wifi' },
            { name: 'Attached Washroom', category: 'Comfort', icon: 'home' },
            { name: 'Laundromat', category: 'Service', icon: 'washing-machine' },
          ],
        },
        weeklyMenu: {
          create: {
            monday: JSON.stringify({
              breakfast: 'Idli Sambar',
              lunch: 'South Veg Meals',
              dinner: 'Paneer Tikka',
            }),
            tuesday: JSON.stringify({ breakfast: 'Dosa', lunch: 'Dal Rice', dinner: 'Mix Veg' }),
            wednesday: JSON.stringify({
              breakfast: 'Puri Saagu',
              lunch: 'Kadi Chawal',
              dinner: 'Chicken Curry',
            }),
            thursday: JSON.stringify({
              breakfast: 'Upma',
              lunch: 'Chole Rice',
              dinner: 'Aloo Paratha',
            }),
            friday: JSON.stringify({
              breakfast: 'Poha',
              lunch: 'Veg Biryani',
              dinner: 'Egg Curry',
            }),
            saturday: JSON.stringify({
              breakfast: 'Uttapam',
              lunch: 'Rajma Rice',
              dinner: 'Dal Tadka',
            }),
            sunday: JSON.stringify({
              breakfast: 'Masala Dosa',
              lunch: 'Chicken Biryani',
              dinner: 'Light Khichdi',
            }),
          },
        },
      },
    });

    console.log('✅ Real Stanza Living PG Listings created.');

    // 4. Create Authentic Resident Reviews (Exact text from user screenshots)
    await prisma.review.create({
      data: {
        pgId: newport.id,
        userId: studentAarav.id,
        rating: 5,
        cleanlinessRating: 5,
        foodRating: 5,
        wifiRating: 5,
        securityRating: 5,
        comment:
          'Food quality and cleaning standards both add to a good stay. Overall service quality in food and cleaning is good. Both areas are well maintained.',
        ownerResponse: 'Thank you Rasal Tech Vlog! We are glad you enjoy staying at Newport House.',
        ownerRespondedAt: new Date(),
      },
    });

    await prisma.review.create({
      data: {
        pgId: salta.id,
        userId: studentHotGaming.id,
        rating: 5,
        cleanlinessRating: 5,
        foodRating: 5,
        wifiRating: 5,
        securityRating: 5,
        comment:
          'The upkeep of the place makes it feel warm and welcoming. Garbage is disposed of correctly and promptly. Bathrooms receive daily cleaning.',
        ownerResponse: 'Thank you Hot Gaming! Appreciate the feedback on cleanliness.',
        ownerRespondedAt: new Date(),
      },
    });

    await prisma.review.create({
      data: {
        pgId: vernon.id,
        userId: studentFxzen.id,
        rating: 5,
        cleanlinessRating: 5,
        foodRating: 5,
        wifiRating: 5,
        securityRating: 5,
        comment:
          'The dining and common area is well coordinated. Positive standards maintained everywhere. Great proximity to NMIT campus.',
        ownerResponse: 'Thank you Fxzen! Happy to have you at Vernon House.',
        ownerRespondedAt: new Date(),
      },
    });

    console.log('✅ Resident Reviews created.');

    console.log('🎉 Seed completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
