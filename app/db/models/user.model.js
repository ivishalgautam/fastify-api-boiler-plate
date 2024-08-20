"use strict";
import constants from "../../lib/constants/index.js";
import hash from "../../lib/encryption/index.js";
import { DataTypes } from "sequelize";
import { Op } from "sequelize";
import moment from "moment";

let UserModel = null;

const init = async (sequelize) => {
  UserModel = sequelize.define(
    constants.models.USER_TABLE,
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true,
        },
        unique: {
          args: true,
          msg: "Email address already in use!",
        },
      },
      mobileNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      countryCode: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      firstname: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      lastname: {
        type: DataTypes.STRING,
        defaultValue: "",
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      role: {
        type: DataTypes.ENUM({
          values: ["admin", "user"],
        }),
        defaultValue: "user",
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      resetPasswordToken: {
        type: DataTypes.STRING,
      },
      confirmationToken: {
        type: DataTypes.STRING,
      },
    },
    {
      timestamps: true,
    }
  );

  await UserModel.sync({ alter: true });
};

const create = async (req) => {
  const hash_password = hash.encrypt(req.body.password);
  return await UserModel.create({
    username: req.body.username,
    password: hash_password,
    firstname: req.body?.firstname,
    lastname: req.body?.lastname,
    email: req.body?.email,
    mobileNumber: req.body?.mobileNumber,
    countryCode: req.body?.countryCode.replace(/\s/g, ""),
    role: req.body?.role,
  });
};

const get = async () => {
  return await UserModel.findAll({
    where: { role: "user" },
    order: [["created_at", "DESC"]],
    attributes: {
      exclude: ["password", "resetPasswordToken", "confirmationToken"],
    },
  });
};

const getById = async (req, user_id) => {
  return await UserModel.findOne({
    where: {
      id: req?.params?.id || user_id,
    },
    raw: true,
    attributes: [
      "id",
      "username",
      "email",
      "firstname",
      "lastname",
      "password",
      "isActive",
      "role",
      "mobileNumber",
      "countryCode",
      "isVerified",
    ],
  });
};

const getByUsername = async (req, record = undefined) => {
  console.log(req.body);
  return await UserModel.findOne({
    where: {
      username: req?.body?.username || record?.user?.username,
    },
    attributes: [
      "id",
      "username",
      "email",
      "firstname",
      "lastname",
      "password",
      "isActive",
      "role",
      "mobileNumber",
      "countryCode",
      "isVerified",
    ],
  });
};

const update = async (req) => {
  return await UserModel.update(
    {
      username: req.body?.username,
      firstname: req.body?.firstname,
      lastname: req.body?.lastname,
      email: req.body?.email,
      mobileNumber: req.body?.mobileNumber,
      countryCode: req.body?.countryCode.replace(/\s/g, ""),

      role: req.body?.role,
    },
    {
      where: {
        id: req.params.id,
      },
      returning: [
        "id",
        "username",
        "email",
        "firstname",
        "lastname",
        "isActive",
        "role",
        "mobileNumber",
        "countryCode",
        "isVerified",
      ],
      plain: true,
    }
  );
};

const updatePassword = async (req, user_id) => {
  const hash_password = hash.encrypt(req.body.new_password);
  return await UserModel.update(
    {
      password: hash_password,
    },
    {
      where: {
        id: req.params?.id || user_id,
      },
    }
  );
};

const deleteById = async (req, user_id) => {
  return await UserModel.destroy({
    where: {
      id: req?.params?.id || user_id,
    },
    returning: true,
    raw: true,
  });
};

const countUser = async (last_30_days = false) => {
  let where_query;
  if (last_30_days) {
    where_query = {
      createdAt: {
        [Op.gte]: moment()
          .subtract(30, "days")
          .format("YYYY-MM-DD HH:mm:ss.SSSZ"),
      },
    };
  }
  return await UserModel.findAll({
    where: where_query,
    attributes: [
      "role",
      [
        UserModel.sequelize.fn("COUNT", UserModel.sequelize.col("role")),
        "total",
      ],
    ],
    group: "role",
    raw: true,
  });
};

const getByEmailId = async (req) => {
  return await UserModel.findOne({
    where: {
      email: req.body.email,
    },
  });
};

const getByResetToken = async (req) => {
  return await UserModel.findOne({
    where: {
      resetPasswordToken: req.params.token,
    },
  });
};

const getByUserIds = async (user_ids) => {
  return await UserModel.findAll({
    where: {
      id: {
        [Op.in]: user_ids,
      },
    },
  });
};

const updateStatus = async (id, status) => {
  const [rowCount, rows] = await UserModel.update(
    {
      isActive: status,
    },
    {
      where: {
        id: id,
      },
      returning: [
        "id",
        "username",
        "email",
        "firstname",
        "lastname",
        "isActive",
        "role",
        "mobileNumber",
        "countryCode",
        "isVerified",
      ],
      plain: true,
      raw: true,
    }
  );

  return rows;
};

const verify = async ({ user_id, status }) => {
  const [rowCount, rows] = await UserModel.update(
    {
      isVerified: status,
    },
    {
      where: {
        id: user_id,
      },
      plain: true,
      raw: true,
    }
  );

  return rows;
};

const findUsersWithBirthdayToday = async () => {
  const startIST = moment().startOf("day").toDate();
  const endIST = moment().endOf("day").toDate();

  try {
    const usersWithBirthdayToday = await UserModel.findAll({
      where: {
        birth_date: {
          [Op.between]: [startIST, endIST],
        },
        role: {
          [Op.in]: ["teacher", "student"],
        },
      },
    });

    return usersWithBirthdayToday;
  } catch (error) {
    console.error("Error finding users with birthday today:", error);
    throw error;
  }
};

export default {
  init: init,
  create: create,
  get: get,
  getById: getById,
  getByUsername: getByUsername,
  update: update,
  updatePassword: updatePassword,
  deleteById: deleteById,
  countUser: countUser,
  getByEmailId: getByEmailId,
  getByResetToken: getByResetToken,
  getByUserIds: getByUserIds,
  findUsersWithBirthdayToday: findUsersWithBirthdayToday,
  updateStatus: updateStatus,
  verify: verify,
};
