const zod = require("zod");
const { User } = require("../db");
//Schemas
const signupSchema = zod.object({
  firstname: zod
    .string({
      required_error: "Firstname is required.",
    })
    .min(1, {
      message: "Firstname should have atleast 2 characters.",
    }),
  lastname: zod
    .string({
      required_error: "Lastname is required.",
    })
    .min(2, {
      message: "Lastname should have atleast 2 characters.",
    }),
  email: zod
    .string({
      required_error: "Email is required.",
    })
    .email({
      message: "Invalid Email Id.",
    }),
  password: zod
    .string({
      required_error: "Password is a required.",
    })
    .min(8, {
      message: "Password should have atleast 8 characters.",
    }),
});
const signinSchema = zod.object({
  email: zod
    .string({
      required_error: "Email is required.",
    })
    .email({
      message: "Invalid Email Id.",
    }),
  password: zod
    .string({
      required_error: "Password is a required.",
    })
    .min(8, {
      message: "Password should have atleast 8 characters.",
    }),
});
//Middlewares
const signupMiddleware = function (req, res, next) {
  const { firstname, lastname, email, password } = req.body;
  const parsed = signupSchema.safeParse({
    firstname,
    lastname,
    email,
    password,
  });
  if (!parsed.success) {
    res.json({
      errors: parsed.error.issues,
    });
    return;
  }
  next();
};

const signinMiddleware = function (req, res, next) {
  const { email, password } = req.body;
  const parsed = signinSchema.safeParse({
    email,
    password,
  });
  if (!parsed.success) {
    res.json({
      errors: parsed.error.issues,
    });
    return;
  }
  next();
};
module.exports = { signupMiddleware, signinMiddleware };
