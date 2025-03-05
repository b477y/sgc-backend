export const UserRole = Object.freeze({
  ADMIN: "admin",
  USER: "user",
});

export const TokenType = Object.freeze({
  ACCESS: "access",
  REFRESH: "refresh",
});

export const AuthProviders = Object.freeze({
  GOOGLE: "google",
  SYSTEM: "system",
});

export const Genders = Object.freeze({
  MALE: "male",
  FEMALE: "female",
});

export const OtpTypes = Object.freeze({
  CONFIRM_EMAIL: "confirm-email",
  FORGOT_PASSWORD: "forgot-password",
});

export const Amenities = Object.freeze({
  Balcony: "Balcony",
  "Parking Spaces": "Parking Spaces",
  "Green Area": "Green Area",
  "Swimming Pool": "Swimming Pool",
  Gym: "Gym",
  Security: "Security",
  "Central AC": "Central AC",
  Elevator: "Elevator",
  Garden: "Garden",
  Playground: "Playground",
  "Backup Generator": "Backup Generator",
  "Fire Alarm": "Fire Alarm",
  Internet: "Internet",
  CCTV: "CCTV",
  Maintenance: "Maintenance",
});

export const Categories = Object.freeze({
  Residential: {
    Apartment: "Apartment",
    House: "House",
    Farm: "Farm",
    "Residential Building": "Residential Building",
    Tourism: "Tourism",
  },
  Plot: {
    "Commercial Plot": "Commercial Plot",
    "Industrial Land": "Industrial Land",
    "Residential Plot": "Residential Plot",
    "Agricultural Plot": "Agricultural Plot",
  },
  Commercial: {
    Office: "Office",
    Shop: "Shop",
    Warehouse: "Warehouse",
    "Commercial Floor": "Commercial Floor",
    "Commercial Building": "Commercial Building",
    Factory: "Factory",
    Showroom: "Showroom",
    "Commercial Property": "Commercial Property",
    "Commercial House": "Commercial House",
    Restaurant: "Restaurant",
    Hotel: "Hotel",
    School: "School",
    "Beauty Salon": "Beauty Salon",
  },
});
