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
};
