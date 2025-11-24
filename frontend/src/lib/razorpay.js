import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_LIVE_KEY_ID,
  key_secret: process.env.RAZORPAY_LIVE_KEY_SECRET,
});

export default razorpay;
