export const schema = {
  signup: {
    body: {
      type: "object",
      properties: {
        username: { type: "string", minLength: 3 },
        password: { type: "string", minLength: 3 },
        firstname: { type: "string", minLength: 3 },
        lastname: { type: "string" },
        email: { type: "string", minLength: 3 },
        mobileNumber: { type: "string", minLength: 3 },
        countryCode: { type: "string", minLength: 1 },
        role: { type: "string", enum: ["admin", "user"] },
      },
      required: [
        "username",
        "password",
        "firstname",
        "lastname",
        "email",
        "mobileNumber",
        "countryCode",
        "role",
      ],
    },
  },
  login: {
    body: {
      type: "object",
      properties: {
        username: { type: "string" },
        password: { type: "string" },
      },
      required: ["username", "password"],
    },
  },
  otpSend: {
    body: {
      type: "object",
      properties: {
        mobile_number: { type: "string" },
        country_code: { type: "string" },
      },
      required: ["mobile_number", "country_code"],
    },
  },
  otpVerify: {
    body: {
      type: "object",
      properties: {
        mobile_number: { type: "string" },
        otp: { type: "string", minLength: 6, maxLength: 6 },
      },
      required: ["mobile_number", "otp"],
    },
  },
};
