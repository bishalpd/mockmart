export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "MockMart";
export const APP_DESCRIPTION =
  process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
  "Your go-to demo e-commerce platform for showcasing online shopping experiences. Explore a seamless interface, product listings, and checkout flows for project demonstrations.";

export const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

export const LATEST_PRODUCTS_LIMIT = Number(process.env.LATEST_PRODUCTS_LIMIT) || 4;
export const SIGNINDEFAULTVALUES = {
  email: "",
  password: "",
};

export const SIGNUPDEFAULTVALUES = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export const shippingAddressDefaultValues = {
  fullName: "",
  streetAddress: "",
  city: "",
  postalCode: "",
  country: "",
};
