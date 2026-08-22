"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/dotenv/lib/main.js
var require_main = __commonJS({
  "node_modules/dotenv/lib/main.js"(exports2, module2) {
    "use strict";
    var fs = require("fs");
    var path2 = require("path");
    var os = require("os");
    var crypto = require("crypto");
    var TIPS = [
      "\u25C8 encrypted .env [www.dotenvx.com]",
      "\u25C8 secrets for agents [www.dotenvx.com]",
      "\u2301 auth for agents [www.vestauth.com]",
      "\u2318 custom filepath { path: '/custom/path/.env' }",
      "\u2318 enable debugging { debug: true }",
      "\u2318 override existing { override: true }",
      "\u2318 suppress logs { quiet: true }",
      "\u2318 multiple files { path: ['.env.local', '.env'] }"
    ];
    function _getRandomTip() {
      return TIPS[Math.floor(Math.random() * TIPS.length)];
    }
    function parseBoolean(value) {
      if (typeof value === "string") {
        return !["false", "0", "no", "off", ""].includes(value.toLowerCase());
      }
      return Boolean(value);
    }
    function supportsAnsi() {
      return process.stdout.isTTY;
    }
    function dim(text) {
      return supportsAnsi() ? `\x1B[2m${text}\x1B[0m` : text;
    }
    var LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
    function parse(src) {
      const obj = {};
      let lines = src.toString();
      lines = lines.replace(/\r\n?/mg, "\n");
      let match;
      while ((match = LINE.exec(lines)) != null) {
        const key = match[1];
        let value = match[2] || "";
        value = value.trim();
        const maybeQuote = value[0];
        value = value.replace(/^(['"`])([\s\S]*)\1$/mg, "$2");
        if (maybeQuote === '"') {
          value = value.replace(/\\n/g, "\n");
          value = value.replace(/\\r/g, "\r");
        }
        obj[key] = value;
      }
      return obj;
    }
    function _parseVault(options) {
      options = options || {};
      const vaultPath = _vaultPath(options);
      options.path = vaultPath;
      const result = DotenvModule.configDotenv(options);
      if (!result.parsed) {
        const err = new Error(`MISSING_DATA: Cannot parse ${vaultPath} for an unknown reason`);
        err.code = "MISSING_DATA";
        throw err;
      }
      const keys = _dotenvKey(options).split(",");
      const length = keys.length;
      let decrypted;
      for (let i = 0; i < length; i++) {
        try {
          const key = keys[i].trim();
          const attrs = _instructions(result, key);
          decrypted = DotenvModule.decrypt(attrs.ciphertext, attrs.key);
          break;
        } catch (error) {
          if (i + 1 >= length) {
            throw error;
          }
        }
      }
      return DotenvModule.parse(decrypted);
    }
    function _warn(message) {
      console.error(`\u26A0 ${message}`);
    }
    function _debug(message) {
      console.log(`\u2506 ${message}`);
    }
    function _log(message) {
      console.log(`\u25C7 ${message}`);
    }
    function _dotenvKey(options) {
      if (options && options.DOTENV_KEY && options.DOTENV_KEY.length > 0) {
        return options.DOTENV_KEY;
      }
      if (process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0) {
        return process.env.DOTENV_KEY;
      }
      return "";
    }
    function _instructions(result, dotenvKey) {
      let uri;
      try {
        uri = new URL(dotenvKey);
      } catch (error) {
        if (error.code === "ERR_INVALID_URL") {
          const err = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
          err.code = "INVALID_DOTENV_KEY";
          throw err;
        }
        throw error;
      }
      const key = uri.password;
      if (!key) {
        const err = new Error("INVALID_DOTENV_KEY: Missing key part");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      }
      const environment = uri.searchParams.get("environment");
      if (!environment) {
        const err = new Error("INVALID_DOTENV_KEY: Missing environment part");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      }
      const environmentKey = `DOTENV_VAULT_${environment.toUpperCase()}`;
      const ciphertext = result.parsed[environmentKey];
      if (!ciphertext) {
        const err = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${environmentKey} in your .env.vault file.`);
        err.code = "NOT_FOUND_DOTENV_ENVIRONMENT";
        throw err;
      }
      return { ciphertext, key };
    }
    function _vaultPath(options) {
      let possibleVaultPath = null;
      if (options && options.path && options.path.length > 0) {
        if (Array.isArray(options.path)) {
          for (const filepath of options.path) {
            if (fs.existsSync(filepath)) {
              possibleVaultPath = filepath.endsWith(".vault") ? filepath : `${filepath}.vault`;
            }
          }
        } else {
          possibleVaultPath = options.path.endsWith(".vault") ? options.path : `${options.path}.vault`;
        }
      } else {
        possibleVaultPath = path2.resolve(process.cwd(), ".env.vault");
      }
      if (fs.existsSync(possibleVaultPath)) {
        return possibleVaultPath;
      }
      return null;
    }
    function _resolveHome(envPath) {
      return envPath[0] === "~" ? path2.join(os.homedir(), envPath.slice(1)) : envPath;
    }
    function _configVault(options) {
      const debug = parseBoolean(process.env.DOTENV_CONFIG_DEBUG || options && options.debug);
      const quiet = parseBoolean(process.env.DOTENV_CONFIG_QUIET || options && options.quiet);
      if (debug || !quiet) {
        _log("loading env from encrypted .env.vault");
      }
      const parsed = DotenvModule._parseVault(options);
      let processEnv = process.env;
      if (options && options.processEnv != null) {
        processEnv = options.processEnv;
      }
      DotenvModule.populate(processEnv, parsed, options);
      return { parsed };
    }
    function configDotenv(options) {
      const dotenvPath = path2.resolve(process.cwd(), ".env");
      let encoding = "utf8";
      let processEnv = process.env;
      if (options && options.processEnv != null) {
        processEnv = options.processEnv;
      }
      let debug = parseBoolean(processEnv.DOTENV_CONFIG_DEBUG || options && options.debug);
      let quiet = parseBoolean(processEnv.DOTENV_CONFIG_QUIET || options && options.quiet);
      if (options && options.encoding) {
        encoding = options.encoding;
      } else {
        if (debug) {
          _debug("no encoding is specified (UTF-8 is used by default)");
        }
      }
      let optionPaths = [dotenvPath];
      if (options && options.path) {
        if (!Array.isArray(options.path)) {
          optionPaths = [_resolveHome(options.path)];
        } else {
          optionPaths = [];
          for (const filepath of options.path) {
            optionPaths.push(_resolveHome(filepath));
          }
        }
      }
      let lastError;
      const parsedAll = {};
      for (const path3 of optionPaths) {
        try {
          const parsed = DotenvModule.parse(fs.readFileSync(path3, { encoding }));
          DotenvModule.populate(parsedAll, parsed, options);
        } catch (e) {
          if (debug) {
            _debug(`failed to load ${path3} ${e.message}`);
          }
          lastError = e;
        }
      }
      const populated = DotenvModule.populate(processEnv, parsedAll, options);
      debug = parseBoolean(processEnv.DOTENV_CONFIG_DEBUG || debug);
      quiet = parseBoolean(processEnv.DOTENV_CONFIG_QUIET || quiet);
      if (debug || !quiet) {
        const keysCount = Object.keys(populated).length;
        const shortPaths = [];
        for (const filePath of optionPaths) {
          try {
            const relative = path2.relative(process.cwd(), filePath);
            shortPaths.push(relative);
          } catch (e) {
            if (debug) {
              _debug(`failed to load ${filePath} ${e.message}`);
            }
            lastError = e;
          }
        }
        _log(`injected env (${keysCount}) from ${shortPaths.join(",")} ${dim(`// tip: ${_getRandomTip()}`)}`);
      }
      if (lastError) {
        return { parsed: parsedAll, error: lastError };
      } else {
        return { parsed: parsedAll };
      }
    }
    function config2(options) {
      if (_dotenvKey(options).length === 0) {
        return DotenvModule.configDotenv(options);
      }
      const vaultPath = _vaultPath(options);
      if (!vaultPath) {
        _warn(`you set DOTENV_KEY but you are missing a .env.vault file at ${vaultPath}`);
        return DotenvModule.configDotenv(options);
      }
      return DotenvModule._configVault(options);
    }
    function decrypt(encrypted, keyStr) {
      const key = Buffer.from(keyStr.slice(-64), "hex");
      let ciphertext = Buffer.from(encrypted, "base64");
      const nonce = ciphertext.subarray(0, 12);
      const authTag = ciphertext.subarray(-16);
      ciphertext = ciphertext.subarray(12, -16);
      try {
        const aesgcm = crypto.createDecipheriv("aes-256-gcm", key, nonce);
        aesgcm.setAuthTag(authTag);
        return `${aesgcm.update(ciphertext)}${aesgcm.final()}`;
      } catch (error) {
        const isRange = error instanceof RangeError;
        const invalidKeyLength = error.message === "Invalid key length";
        const decryptionFailed = error.message === "Unsupported state or unable to authenticate data";
        if (isRange || invalidKeyLength) {
          const err = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
          err.code = "INVALID_DOTENV_KEY";
          throw err;
        } else if (decryptionFailed) {
          const err = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
          err.code = "DECRYPTION_FAILED";
          throw err;
        } else {
          throw error;
        }
      }
    }
    function populate(processEnv, parsed, options = {}) {
      const debug = Boolean(options && options.debug);
      const override = Boolean(options && options.override);
      const populated = {};
      if (typeof parsed !== "object") {
        const err = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
        err.code = "OBJECT_REQUIRED";
        throw err;
      }
      for (const key of Object.keys(parsed)) {
        if (Object.prototype.hasOwnProperty.call(processEnv, key)) {
          if (override === true) {
            processEnv[key] = parsed[key];
            populated[key] = parsed[key];
          }
          if (debug) {
            if (override === true) {
              _debug(`"${key}" is already defined and WAS overwritten`);
            } else {
              _debug(`"${key}" is already defined and was NOT overwritten`);
            }
          }
        } else {
          processEnv[key] = parsed[key];
          populated[key] = parsed[key];
        }
      }
      return populated;
    }
    var DotenvModule = {
      configDotenv,
      _configVault,
      _parseVault,
      config: config2,
      decrypt,
      parse,
      populate
    };
    module2.exports.configDotenv = DotenvModule.configDotenv;
    module2.exports._configVault = DotenvModule._configVault;
    module2.exports._parseVault = DotenvModule._parseVault;
    module2.exports.config = DotenvModule.config;
    module2.exports.decrypt = DotenvModule.decrypt;
    module2.exports.parse = DotenvModule.parse;
    module2.exports.populate = DotenvModule.populate;
    module2.exports = DotenvModule;
  }
});

// node_modules/dotenv/lib/env-options.js
var require_env_options = __commonJS({
  "node_modules/dotenv/lib/env-options.js"(exports2, module2) {
    "use strict";
    var options = {};
    if (process.env.DOTENV_CONFIG_ENCODING != null) {
      options.encoding = process.env.DOTENV_CONFIG_ENCODING;
    }
    if (process.env.DOTENV_CONFIG_PATH != null) {
      options.path = process.env.DOTENV_CONFIG_PATH;
    }
    if (process.env.DOTENV_CONFIG_QUIET != null) {
      options.quiet = process.env.DOTENV_CONFIG_QUIET;
    }
    if (process.env.DOTENV_CONFIG_DEBUG != null) {
      options.debug = process.env.DOTENV_CONFIG_DEBUG;
    }
    if (process.env.DOTENV_CONFIG_OVERRIDE != null) {
      options.override = process.env.DOTENV_CONFIG_OVERRIDE;
    }
    if (process.env.DOTENV_CONFIG_DOTENV_KEY != null) {
      options.DOTENV_KEY = process.env.DOTENV_CONFIG_DOTENV_KEY;
    }
    module2.exports = options;
  }
});

// node_modules/dotenv/lib/cli-options.js
var require_cli_options = __commonJS({
  "node_modules/dotenv/lib/cli-options.js"(exports2, module2) {
    "use strict";
    var re = /^dotenv_config_(encoding|path|quiet|debug|override|DOTENV_KEY)=(.+)$/;
    module2.exports = function optionMatcher(args) {
      const options = args.reduce(function(acc, cur) {
        const matches = cur.match(re);
        if (matches) {
          acc[matches[1]] = matches[2];
        }
        return acc;
      }, {});
      if (!("quiet" in options)) {
        options.quiet = "true";
      }
      return options;
    };
  }
});

// src/server.ts
var import_node = require("better-auth/node");

// src/app.ts
var import_express2 = __toESM(require("express"));

// src/modules/post/post.router.ts
var import_express = __toESM(require("express"));

// node_modules/dotenv/config.js
(function() {
  require_main().config(
    Object.assign(
      {},
      require_env_options(),
      require_cli_options()(process.argv)
    )
  );
})();

// generated/prisma/client.ts
var path = __toESM(require("path"));
var import_node_url = require("url");

// generated/prisma/internal/class.ts
var runtime = __toESM(require("@prisma/client/runtime/client"));
var config = {
  "previewFeatures": [],
  "clientVersion": "7.9.1",
  "engineVersion": "e922089b7d7502aff4249d5da3420f6fa55fc6ad",
  "activeProvider": "postgresql",
  "inlineSchema": '// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Get a free hosted Postgres database in seconds: `npx create-db`\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel Post {\n  id         String     @id @default(uuid())\n  title      String     @db.VarChar(225)\n  content    String     @db.Text\n  thumbnail  String?\n  isFeatured Boolean    @default(false)\n  status     PostStatus @default(DRAFT)\n  tags       String[]\n  view       Int        @default(0)\n  authorId   String //better Auth\n  createdAt  DateTime   @default(now())\n  updatedAt  DateTime   @updatedAt\n  comments   Comment[]\n\n  @@index([authorId])\n  @@map("Posts")\n}\n\nmodel Comment {\n  id        String        @id @default(uuid())\n  content   String\n  authorId  String //better Auth\n  postId    String\n  post      Post          @relation(fields: [postId], references: [id])\n  parentId  String?\n  parent    Comment?      @relation("CommentReplies", fields: [parentId], references: [id])\n  replies   Comment[]     @relation("CommentReplies")\n  status    CommentStatus @default(APPROVED)\n  createdAt DateTime      @default(now())\n  updatedAt DateTime      @updatedAt\n}\n\nenum PostStatus {\n  DRAFT\n  PUBLISHED\n  ARCHIVED\n}\n\nenum CommentStatus {\n  APPROVED\n  REJECT\n}\n\nmodel User {\n  id            String    @id\n  name          String\n  email         String\n  emailVerified Boolean   @default(false)\n  image         String?\n  createdAt     DateTime  @default(now())\n  updatedAt     DateTime  @updatedAt\n  sessions      Session[]\n  accounts      Account[]\n\n  role   String? @default("USER")\n  status String? @default("ACTIVE")\n  phone  String?\n\n  @@unique([email])\n  @@map("user")\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"Post":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"content","kind":"scalar","type":"String"},{"name":"thumbnail","kind":"scalar","type":"String"},{"name":"isFeatured","kind":"scalar","type":"Boolean"},{"name":"status","kind":"enum","type":"PostStatus"},{"name":"tags","kind":"scalar","type":"String"},{"name":"view","kind":"scalar","type":"Int"},{"name":"authorId","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"comments","kind":"object","type":"Comment","relationName":"CommentToPost"}],"dbName":"Posts"},"Comment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"content","kind":"scalar","type":"String"},{"name":"authorId","kind":"scalar","type":"String"},{"name":"postId","kind":"scalar","type":"String"},{"name":"post","kind":"object","type":"Post","relationName":"CommentToPost"},{"name":"parentId","kind":"scalar","type":"String"},{"name":"parent","kind":"object","type":"Comment","relationName":"CommentReplies"},{"name":"replies","kind":"object","type":"Comment","relationName":"CommentReplies"},{"name":"status","kind":"enum","type":"CommentStatus"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"role","kind":"scalar","type":"String"},{"name":"status","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"}],"dbName":"user"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","post","parent","replies","_count","comments","Post.findUnique","Post.findUniqueOrThrow","Post.findFirst","Post.findFirstOrThrow","Post.findMany","data","Post.createOne","Post.createMany","Post.createManyAndReturn","Post.updateOne","Post.updateMany","Post.updateManyAndReturn","create","update","Post.upsertOne","Post.deleteOne","Post.deleteMany","having","_avg","_sum","_min","_max","Post.groupBy","Post.aggregate","Comment.findUnique","Comment.findUniqueOrThrow","Comment.findFirst","Comment.findFirstOrThrow","Comment.findMany","Comment.createOne","Comment.createMany","Comment.createManyAndReturn","Comment.updateOne","Comment.updateMany","Comment.updateManyAndReturn","Comment.upsertOne","Comment.deleteOne","Comment.deleteMany","Comment.groupBy","Comment.aggregate","user","sessions","accounts","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","User.upsertOne","User.deleteOne","User.deleteMany","User.groupBy","User.aggregate","Session.findUnique","Session.findUniqueOrThrow","Session.findFirst","Session.findFirstOrThrow","Session.findMany","Session.createOne","Session.createMany","Session.createManyAndReturn","Session.updateOne","Session.updateMany","Session.updateManyAndReturn","Session.upsertOne","Session.deleteOne","Session.deleteMany","Session.groupBy","Session.aggregate","Account.findUnique","Account.findUniqueOrThrow","Account.findFirst","Account.findFirstOrThrow","Account.findMany","Account.createOne","Account.createMany","Account.createManyAndReturn","Account.updateOne","Account.updateMany","Account.updateManyAndReturn","Account.upsertOne","Account.deleteOne","Account.deleteMany","Account.groupBy","Account.aggregate","Verification.findUnique","Verification.findUniqueOrThrow","Verification.findFirst","Verification.findFirstOrThrow","Verification.findMany","Verification.createOne","Verification.createMany","Verification.createManyAndReturn","Verification.updateOne","Verification.updateMany","Verification.updateManyAndReturn","Verification.upsertOne","Verification.deleteOne","Verification.deleteMany","Verification.groupBy","Verification.aggregate","AND","OR","NOT","id","identifier","value","expiresAt","createdAt","updatedAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","accountId","providerId","userId","accessToken","refreshToken","idToken","accessTokenExpiresAt","refreshTokenExpiresAt","scope","password","token","ipAddress","userAgent","name","email","emailVerified","image","role","status","phone","every","some","none","content","authorId","postId","parentId","CommentStatus","title","thumbnail","isFeatured","PostStatus","tags","view","has","hasEvery","hasSome","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","increment","decrement","multiply","divide","push"]'),
  graph: "0AI2YA8HAADSAQAgcwAAzwEAMHQAAAwAEHUAAM8BADB2AQAAAAF6QACsAQAhe0AArAEAIZkBAADQAacBIp4BAQCrAQAhnwEBAKsBACGjAQEAqwEAIaQBAQC8AQAhpQEgALsBACGnAQAAyQEAIKgBAgDRAQAhAQAAAAEAIA4DAADVAQAgBAAA1gEAIAUAANIBACBzAADTAQAwdAAAAwAQdQAA0wEAMHYBAKsBACF6QACsAQAhe0AArAEAIZkBAADUAaMBIp4BAQCrAQAhnwEBAKsBACGgAQEAqwEAIaEBAQC8AQAhBAMAALcCACAEAAC4AgAgBQAAtgIAIKEBAADcAQAgDgMAANUBACAEAADWAQAgBQAA0gEAIHMAANMBADB0AAADABB1AADTAQAwdgEAAAABekAArAEAIXtAAKwBACGZAQAA1AGjASKeAQEAqwEAIZ8BAQCrAQAhoAEBAKsBACGhAQEAvAEAIQMAAAADACABAAAEADACAAAFACABAAAAAwAgAwAAAAMAIAEAAAQAMAIAAAUAIAEAAAADACABAAAAAwAgAQAAAAEAIA8HAADSAQAgcwAAzwEAMHQAAAwAEHUAAM8BADB2AQCrAQAhekAArAEAIXtAAKwBACGZAQAA0AGnASKeAQEAqwEAIZ8BAQCrAQAhowEBAKsBACGkAQEAvAEAIaUBIAC7AQAhpwEAAMkBACCoAQIA0QEAIQIHAAC2AgAgpAEAANwBACADAAAADAAgAQAADQAwAgAAAQAgAwAAAAwAIAEAAA0AMAIAAAEAIAMAAAAMACABAAANADACAAABACAMBwAAtQIAIHYBAAAAAXpAAAAAAXtAAAAAAZkBAAAApwECngEBAAAAAZ8BAQAAAAGjAQEAAAABpAEBAAAAAaUBIAAAAAGnAQAAtAIAIKgBAgAAAAEBDQAAEQAgC3YBAAAAAXpAAAAAAXtAAAAAAZkBAAAApwECngEBAAAAAZ8BAQAAAAGjAQEAAAABpAEBAAAAAaUBIAAAAAGnAQAAtAIAIKgBAgAAAAEBDQAAEwAwAQ0AABMAMAwHAACqAgAgdgEA2gEAIXpAANsBACF7QADbAQAhmQEAAKcCpwEingEBANoBACGfAQEA2gEAIaMBAQDaAQAhpAEBAOABACGlASAA7AEAIacBAACoAgAgqAECAKkCACECAAAAAQAgDQAAFgAgC3YBANoBACF6QADbAQAhe0AA2wEAIZkBAACnAqcBIp4BAQDaAQAhnwEBANoBACGjAQEA2gEAIaQBAQDgAQAhpQEgAOwBACGnAQAAqAIAIKgBAgCpAgAhAgAAAAwAIA0AABgAIAIAAAAMACANAAAYACADAAAAAQAgFAAAEQAgFQAAFgAgAQAAAAEAIAEAAAAMACAGBgAAogIAIBoAAKMCACAbAACmAgAgHAAApQIAIB0AAKQCACCkAQAA3AEAIA5zAADHAQAwdAAAHwAQdQAAxwEAMHYBAKMBACF6QACkAQAhe0AApAEAIZkBAADIAacBIp4BAQCjAQAhnwEBAKMBACGjAQEAowEAIaQBAQCuAQAhpQEgALcBACGnAQAAyQEAIKgBAgDKAQAhAwAAAAwAIAEAAB4AMBkAAB8AIAMAAAAMACABAAANADACAAABACABAAAABQAgAQAAAAUAIAMAAAADACABAAAEADACAAAFACADAAAAAwAgAQAABAAwAgAABQAgAwAAAAMAIAEAAAQAMAIAAAUAIAsDAACfAgAgBAAAoQIAIAUAAKACACB2AQAAAAF6QAAAAAF7QAAAAAGZAQAAAKMBAp4BAQAAAAGfAQEAAAABoAEBAAAAAaEBAQAAAAEBDQAAJwAgCHYBAAAAAXpAAAAAAXtAAAAAAZkBAAAAowECngEBAAAAAZ8BAQAAAAGgAQEAAAABoQEBAAAAAQENAAApADABDQAAKQAwAQAAAAMAIAsDAACQAgAgBAAAkQIAIAUAAJICACB2AQDaAQAhekAA2wEAIXtAANsBACGZAQAAjwKjASKeAQEA2gEAIZ8BAQDaAQAhoAEBANoBACGhAQEA4AEAIQIAAAAFACANAAAtACAIdgEA2gEAIXpAANsBACF7QADbAQAhmQEAAI8CowEingEBANoBACGfAQEA2gEAIaABAQDaAQAhoQEBAOABACECAAAAAwAgDQAALwAgAgAAAAMAIA0AAC8AIAEAAAADACADAAAABQAgFAAAJwAgFQAALQAgAQAAAAUAIAEAAAADACAEBgAAjAIAIBwAAI4CACAdAACNAgAgoQEAANwBACALcwAAwwEAMHQAADcAEHUAAMMBADB2AQCjAQAhekAApAEAIXtAAKQBACGZAQAAxAGjASKeAQEAowEAIZ8BAQCjAQAhoAEBAKMBACGhAQEArgEAIQMAAAADACABAAA2ADAZAAA3ACADAAAAAwAgAQAABAAwAgAABQAgDzEAAL0BACAyAAC-AQAgcwAAugEAMHQAAEcAEHUAALoBADB2AQAAAAF6QACsAQAhe0AArAEAIZQBAQCrAQAhlQEBAAAAAZYBIAC7AQAhlwEBALwBACGYAQEAvAEAIZkBAQC8AQAhmgEBALwBACEBAAAAOgAgDDAAAMEBACBzAADCAQAwdAAAPAAQdQAAwgEAMHYBAKsBACF5QACsAQAhekAArAEAIXtAAKwBACGJAQEAqwEAIZEBAQCrAQAhkgEBALwBACGTAQEAvAEAIQMwAACLAgAgkgEAANwBACCTAQAA3AEAIAwwAADBAQAgcwAAwgEAMHQAADwAEHUAAMIBADB2AQAAAAF5QACsAQAhekAArAEAIXtAAKwBACGJAQEAqwEAIZEBAQAAAAGSAQEAvAEAIZMBAQC8AQAhAwAAADwAIAEAAD0AMAIAAD4AIBEwAADBAQAgcwAAvwEAMHQAAEAAEHUAAL8BADB2AQCrAQAhekAArAEAIXtAAKwBACGHAQEAqwEAIYgBAQCrAQAhiQEBAKsBACGKAQEAvAEAIYsBAQC8AQAhjAEBALwBACGNAUAAwAEAIY4BQADAAQAhjwEBALwBACGQAQEAvAEAIQgwAACLAgAgigEAANwBACCLAQAA3AEAIIwBAADcAQAgjQEAANwBACCOAQAA3AEAII8BAADcAQAgkAEAANwBACARMAAAwQEAIHMAAL8BADB0AABAABB1AAC_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_ACACAAAAQAAgDQAAfwAgAwAAAEIAIBQAAHgAIBUAAH0AIAEAAABCACABAAAAQAAgCgYAAN0BACAcAADfAQAgHQAA3gEAIIoBAADcAQAgiwEAANwBACCMAQAA3AEAII0BAADcAQAgjgEAANwBACCPAQAA3AEAIJABAADcAQAgEHMAAK0BADB0AACGAQAQdQAArQEAMHYBAKMBACF6QACkAQAhe0AApAEAIYcBAQCjAQAhiAEBAKMBACGJAQEAowEAIYoBAQCuAQAhiwEBAK4BACGMAQEArgEAIY0BQACvAQAhjgFAAK8BACGPAQEArgEAIZABAQCuAQAhAwAAAEAAIAEAAIUBADAZAACGAQAgAwAAAEAAIAEAAEEAMAIAAEIAIAlzAACqAQAwdAAAjAEAEHUAAKoBADB2AQAAAAF3AQCrAQAheAEAqwEAIXlAAKwBACF6QACsAQAhe0AArAEAIQEAAACJAQAgAQAAAIkBACAJcwAAqgEAMHQAAIwBABB1AACqAQAwdgEAqwEAIXcBAKsBACF4AQCrAQAheUAArAEAIXpAAKwBACF7QACsAQAhAAMAAACMAQAgAQAAjQEAMAIAAIkBACADAAAAjAEAIAEAAI0BADACAACJAQAgAwAAAIwBACABAACNAQAwAgAAiQEAIAZ2AQAAAAF3AQAAAAF4AQAAAAF5QAAAAAF6QAAAAAF7QAAAAAEBDQAAkQEAIAZ2AQAAAAF3AQAAAAF4AQAAAAF5QAAAAAF6QAAAAAF7QAAAAAEBDQAAkwEAMAENAACTAQAwBnYBANoBACF3AQDaAQAheAEA2gEAIXlAANsBACF6QADbAQAhe0AA2wEAIQIAAACJAQAgDQAAlgEAIAZ2AQDaAQAhdwEA2gEAIXgBANoBACF5QADbAQAhekAA2wEAIXtAANsBACECAAAAjAEAIA0AAJgBACACAAAAjAEAIA0AAJgBACADAAAAiQEAIBQAAJEBACAVAACWAQAgAQAAAIkBACABAAAAjAEAIAMGAADXAQAgHAAA2QEAIB0AANgBACAJcwAAogEAMHQAAJ8BABB1AACiAQAwdgEAowEAIXcBAKMBACF4AQCjAQAheUAApAEAIXpAAKQBACF7QACkAQAhAwAAAIwBACABAACeAQAwGQAAnwEAIAMAAACMAQAgAQAAjQEAMAIAAIkBACAJcwAAogEAMHQAAJ8BABB1AACiAQAwdgEAowEAIXcBAKMBACF4AQCjAQAheUAApAEAIXpAAKQBACF7QACkAQAhDgYAAKYBACAcAACpAQAgHQAAqQEAIHwBAAAAAX0BAAAABH4BAAAABH8BAAAAAYABAQAAAAGBAQEAAAABggEBAAAAAYMBAQCoAQAhhAEBAAAAAYUBAQAAAAGGAQEAAAABCwYAAKYBACAcAACnAQAgHQAApwEAIHxAAAAAAX1AAAAABH5AAAAABH9AAAAAAYABQAAAAAGBAUAAAAABggFAAAAAAYMBQAClAQAhCwYAAKYBACAcAACnAQAgHQAApwEAIHxAAAAAAX1AAAAABH5AAAAABH9AAAAAAYABQAAAAAGBAUAAAAABggFAAAAAAYMBQAClAQAhCHwCAAAAAX0CAAAABH4CAAAABH8CAAAAAYABAgAAAAGBAQIAAAABggECAAAAAYMBAgCmAQAhCHxAAAAAAX1AAAAABH5AAAAABH9AAAAAAYABQAAAAAGBAUAAAAABggFAAAAAAYMBQACnAQAhDgYAAKYBACAcAACpAQAgHQAAqQEAIHwBAAAAAX0BAAAABH4BAAAABH8BAAAAAYABAQAAAAGBAQEAAAABggEBAAAAAYMBAQCoAQAhhAEBAAAAAYUBAQAAAAGGAQEAAAABC3wBAAAAAX0BAAAABH4BAAAABH8BAAAAAYABAQAAAAGBAQEAAAABggEBAAAAAYMBAQCpAQAhhAEBAAAAAYUBAQAAAAGGAQEAAAABCXMAAKoBADB0AACMAQAQdQAAqgEAMHYBAKsBACF3AQCrAQAheAEAqwEAIXlAAKwBACF6QACsAQAhe0AArAEAIQt8AQAAAAF9AQAAAAR-AQAAAAR_AQAAAAGAAQEAAAABgQEBAAAAAYIBAQAAAAGDAQEAqQEAIYQBAQAAAAGFAQEAAAABhgEBAAAAAQh8QAAAAAF9QAAAAAR-QAAAAAR_QAAAAAGAAUAAAAABgQFAAAAAAYIBQAAAAAGDAUAApwEAIRBzAACtAQAwdAAAhgEAEHUAAK0BADB2AQCjAQAhekAApAEAIXtAAKQBACGHAQEAowEAIYgBAQCjAQAhiQEBAKMBACGKAQEArgEAIYsBAQCuAQAhjAEBAK4BACGNAUAArwEAIY4BQACvAQAhjwEBAK4BACGQAQEArgEAIQ4GAACxAQAgHAAAtAEAIB0AALQBACB8AQAAAAF9AQAAAAV-AQAAAAV_AQAAAAGAAQEAAAABgQEBAAAAAYIBAQAAAAGDAQEAswEAIYQBAQAAAAGFAQEAAAABhgEBAAAAAQsGAACxAQAgHAAAsgEAIB0AALIBACB8QAAAAAF9QAAAAAV-QAAAAAV_QAAAAAGAAUAAAAABgQFAAAAAAYIBQAAAAAGDAUAAsAEAIQsGAACxAQAgHAAAsgEAIB0AALIBACB8QAAAAAF9QAAAAAV-QAAAAAV_QAAAAAGAAUAAAAABgQFAAAAAAYIBQAAAAAGDAUAAsAEAIQh8AgAAAAF9AgAAAAV-AgAAAAV_AgAAAAGAAQIAAAABgQECAAAAAYIBAgAAAAGDAQIAsQEAIQh8QAAAAAF9QAAAAAV-QAAAAAV_QAAAAAGAAUAAAAABgQFAAAAAAYIBQAAAAAGDAUAAsgEAIQ4GAACxAQAgHAAAtAEAIB0AALQBACB8AQAAAAF9AQAAAAV-AQAAAAV_AQAAAAGAAQEAAAABgQEBAAAAAYIBAQAAAAGDAQEAswEAIYQBAQAAAAGFAQEAAAABhgEBAAAAAQt8AQAAAAF9AQAAAAV-AQAAAAV_AQAAAAGAAQEAAAABgQEBAAAAAYIBAQAAAAGDAQEAtAEAIYQBAQAAAAGFAQEAAAABhgEBAAAAAQtzAAC1AQAwdAAAcAAQdQAAtQEAMHYBAKMBACF5QACkAQAhekAApAEAIXtAAKQBACGJAQEAowEAIZEBAQCjAQAhkgEBAK4BACGTAQEArgEAIQ1zAAC2AQAwdAAAWgAQdQAAtgEAMHYBAKMBACF6QACkAQAhe0AApAEAIZQBAQCjAQAhlQEBAKMBACGWASAAtwEAIZcBAQCuAQAhmAEBAK4BACGZAQEArgEAIZoBAQCuAQAhBQYAAKYBACAcAAC5AQAgHQAAuQEAIHwgAAAAAYMBIAC4AQAhBQYAAKYBACAcAAC5AQAgHQAAuQEAIHwgAAAAAYMBIAC4AQAhAnwgAAAAAYMBIAC5AQAhDzEAAL0BACAyAAC-AQAgcwAAugEAMHQAAEcAEHUAALoBADB2AQCrAQAhekAArAEAIXtAAKwBACGUAQEAqwEAIZUBAQCrAQAhlgEgALsBACGXAQEAvAEAIZgBAQC8AQAhmQEBALwBACGaAQEAvAEAIQJ8IAAAAAGDASAAuQEAIQt8AQAAAAF9AQAAAAV-AQAAAAV_AQAAAAGAAQEAAAABgQEBAAAAAYIBAQAAAAGDAQEAtAEAIYQBAQAAAAGFAQEAAAABhgEBAAAAAQObAQAAPAAgnAEAADwAIJ0BAAA8ACADmwEAAEAAIJwBAABAACCdAQAAQAAgETAAAMEBACBzAAC_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_gEAILEBAAD_AQAwsgEAAP8BADCzAQAA_wEAMLQBAAD_AQAwtQEAAIECADC2AQAAggIAMAsUAADvAQAwFQAA9AEAMK4BAADwAQAwrwEAAPEBADCwAQAA8gEAILEBAADzAQAwsgEAAPMBADCzAQAA8wEAMLQBAADzAQAwtQEAAPUBADC2AQAA9gEAMAx2AQAAAAF6QAAAAAF7QAAAAAGHAQEAAAABiAEBAAAAAYoBAQAAAAGLAQEAAAABjAEBAAAAAY0BQAAAAAGOAUAAAAABjwEBAAAAAZABAQAAAAECAAAAQgAgFAAA-gEAIAMAAABCACAUAAD6AQAgFQAA-QEAIAENAADGAgAwETAAAMEBACBzAAC_AQAwdAAAQAAQdQAAvwEAMHYBAAAAAXpAAKwBACF7QACsAQAhhwEBAKsBACGIAQEAqwEAIYkBAQCrAQAhigEBALwBACGLAQEAvAEAIYwBAQC8AQAhjQFAAMABACGOAUAAwAEAIY8BAQC8AQAhkAEBALwBACECAAAAQgAgDQAA-QEAIAIAAAD3AQAgDQAA-AEAIBBzAAD2AQAwdAAA9wEAEHUAAPYBADB2AQCrAQAhekAArAEAIXtAAKwBACGHAQEAqwEAIYgBAQCrAQAhiQEBAKsBACGKAQEAvAEAIYsBAQC8AQAhjAEBALwBACGNAUAAwAEAIY4BQADAAQAhjwEBALwBACGQAQEAvAEAIRBzAAD2AQAwdAAA9wEAEHUAAPYBADB2AQCrAQAhekAArAEAIXtAAKwBACGHAQEAqwEAIYgBAQCrAQAhiQEBAKsBACGKAQEAvAEAIYsBAQC8AQAhjAEBALwBACGNAUAAwAEAIY4BQADAAQAhjwEBALwBACGQAQEAvAEAIQx2AQDaAQAhekAA2wEAIXtAANsBACGHAQEA2gEAIYgBAQDaAQAhigEBAOABACGLAQEA4AEAIYwBAQDgAQAhjQFAAOEBACGOAUAA4QEAIY8BAQDgAQAhkAEBAOABACEMdgEA2gEAIXpAANsBACF7QADbAQAhhwEBANoBACGIAQEA2gEAIYoBAQDgAQAhiwEBAOABACGMAQEA4AEAIY0BQADhAQAhjgFAAOEBACGPAQEA4AEAIZABAQDgAQAhDHYBAAAAAXpAAAAAAXtAAAAAAYcBAQAAAAGIAQEAAAABigEBAAAAAYsBAQAAAAGMAQEAAAABjQFAAAAAAY4BQAAAAAGPAQEAAAABkAEBAAAAAQd2AQAAAAF5QAAAAAF6QAAAAAF7QAAAAAGRAQEAAAABkgEBAAAAAZMBAQAAAAECAAAAPgAgFAAAhgIAIAMAAAA-ACAUAACGAgAgFQAAhQIAIAENAADFAgAwDDAAAMEBACBzAADCAQAwdAAAPAAQdQAAwgEAMHYBAAAAAXlAAKwBACF6QACsAQAhe0AArAEAIYkBAQCrAQAhkQEBAAAAAZIBAQC8AQAhkwEBALwBACECAAAAPgAgDQAAhQIAIAIAAACDAgAgDQAAhAIAIAtzAACCAgAwdAAAgwIAEHUAAIICADB2AQCrAQAheUAArAEAIXpAAKwBACF7QACsAQAhiQEBAKsBACGRAQEAqwEAIZIBAQC8AQAhkwEBALwBACELcwAAggIAMHQAAIMCABB1AACCAgAwdgEAqwEAIXlAAKwBACF6QACsAQAhe0AArAEAIYkBAQCrAQAhkQEBAKsBACGSAQEAvAEAIZMBAQC8AQAhB3YBANoBACF5QADbAQAhekAA2wEAIXtAANsBACGRAQEA2gEAIZIBAQDgAQAhkwEBAOABACEHdgEA2gEAIXlAANsBACF6QADbAQAhe0AA2wEAIZEBAQDaAQAhkgEBAOABACGTAQEA4AEAIQd2AQAAAAF5QAAAAAF6QAAAAAF7QAAAAAGRAQEAAAABkgEBAAAAAZMBAQAAAAEEFAAA-wEAMK4BAAD8AQAwsAEAAP4BACC0AQAA_wEAMAQUAADvAQAwrgEAAPABADCwAQAA8gEAILQBAADzAQAwAAAGMQAAiQIAIDIAAIoCACCXAQAA3AEAIJgBAADcAQAgmQEAANwBACCaAQAA3AEAIAAAAAGxAQAAAKMBAgUUAAC8AgAgFQAAwwIAIK4BAAC9AgAgrwEAAMICACC0AQAAAQAgBxQAALoCACAVAADAAgAgrgEAALsCACCvAQAAvwIAILIBAAADACCzAQAAAwAgtAEAAAUAIAsUAACTAgAwFQAAmAIAMK4BAACUAgAwrwEAAJUCADCwAQAAlgIAILEBAACXAgAwsgEAAJcCADCzAQAAlwIAMLQBAACXAgAwtQEAAJkCADC2AQAAmgIAMAkDAACfAgAgBQAAoAIAIHYBAAAAAXpAAAAAAXtAAAAAAZkBAAAAowECngEBAAAAAZ8BAQAAAAGgAQEAAAABAgAAAAUAIBQAAJ4CACADAAAABQAgFAAAngIAIBUAAJ0CACABDQAAvgIAMA4DAADVAQAgBAAA1gEAIAUAANIBACBzAADTAQAwdAAAAwAQdQAA0wEAMHYBAAAAAXpAAKwBACF7QACsAQAhmQEAANQBowEingEBAKsBACGfAQEAqwEAIaABAQCrAQAhoQEBALwBACECAAAABQAgDQAAnQIAIAIAAACbAgAgDQAAnAIAIAtzAACaAgAwdAAAmwIAEHUAAJoCADB2AQCrAQAhekAArAEAIXtAAKwBACGZAQAA1AGjASKeAQEAqwEAIZ8BAQCrAQAhoAEBAKsBACGhAQEAvAEAIQtzAACaAgAwdAAAmwIAEHUAAJoCADB2AQCrAQAhekAArAEAIXtAAKwBACGZAQAA1AGjASKeAQEAqwEAIZ8BAQCrAQAhoAEBAKsBACGhAQEAvAEAIQd2AQDaAQAhekAA2wEAIXtAANsBACGZAQAAjwKjASKeAQEA2gEAIZ8BAQDaAQAhoAEBANoBACEJAwAAkAIAIAUAAJICACB2AQDaAQAhekAA2wEAIXtAANsBACGZAQAAjwKjASKeAQEA2gEAIZ8BAQDaAQAhoAEBANoBACEJAwAAnwIAIAUAAKACACB2AQAAAAF6QAAAAAF7QAAAAAGZAQAAAKMBAp4BAQAAAAGfAQEAAAABoAEBAAAAAQMUAAC8AgAgrgEAAL0CACC0AQAAAQAgBBQAAJMCADCuAQAAlAIAMLABAACWAgAgtAEAAJcCADADFAAAugIAIK4BAAC7AgAgtAEAAAUAIAAAAAAAAbEBAAAApwECArEBAQAAAAS7AQEAAAAFBbEBAgAAAAG3AQIAAAABuAECAAAAAbkBAgAAAAG6AQIAAAABCxQAAKsCADAVAACvAgAwrgEAAKwCADCvAQAArQIAMLABAACuAgAgsQEAAJcCADCyAQAAlwIAMLMBAACXAgAwtAEAAJcCADC1AQAAsAIAMLYBAACaAgAwCQQAAKECACAFAACgAgAgdgEAAAABekAAAAABe0AAAAABmQEAAACjAQKeAQEAAAABnwEBAAAAAaEBAQAAAAECAAAABQAgFAAAswIAIAMAAAAFACAUAACzAgAgFQAAsgIAIAENAAC5AgAwAgAAAAUAIA0AALICACACAAAAmwIAIA0AALECACAHdgEA2gEAIXpAANsBACF7QADbAQAhmQEAAI8CowEingEBANoBACGfAQEA2gEAIaEBAQDgAQAhCQQAAJECACAFAACSAgAgdgEA2gEAIXpAANsBACF7QADbAQAhmQEAAI8CowEingEBANoBACGfAQEA2gEAIaEBAQDgAQAhCQQAAKECACAFAACgAgAgdgEAAAABekAAAAABe0AAAAABmQEAAACjAQKeAQEAAAABnwEBAAAAAaEBAQAAAAEBsQEBAAAABAQUAACrAgAwrgEAAKwCADCwAQAArgIAILQBAACXAgAwAAIHAAC2AgAgpAEAANwBACAEAwAAtwIAIAQAALgCACAFAAC2AgAgoQEAANwBACAHdgEAAAABekAAAAABe0AAAAABmQEAAACjAQKeAQEAAAABnwEBAAAAAaEBAQAAAAEKAwAAnwIAIAQAAKECACB2AQAAAAF6QAAAAAF7QAAAAAGZAQAAAKMBAp4BAQAAAAGfAQEAAAABoAEBAAAAAaEBAQAAAAECAAAABQAgFAAAugIAIAt2AQAAAAF6QAAAAAF7QAAAAAGZAQAAAKcBAp4BAQAAAAGfAQEAAAABowEBAAAAAaQBAQAAAAGlASAAAAABpwEAALQCACCoAQIAAAABAgAAAAEAIBQAALwCACAHdgEAAAABekAAAAABe0AAAAABmQEAAACjAQKeAQEAAAABnwEBAAAAAaABAQAAAAEDAAAAAwAgFAAAugIAIBUAAMECACAMAAAAAwAgAwAAkAIAIAQAAJECACANAADBAgAgdgEA2gEAIXpAANsBACF7QADbAQAhmQEAAI8CowEingEBANoBACGfAQEA2gEAIaABAQDaAQAhoQEBAOABACEKAwAAkAIAIAQAAJECACB2AQDaAQAhekAA2wEAIXtAANsBACGZAQAAjwKjASKeAQEA2gEAIZ8BAQDaAQAhoAEBANoBACGhAQEA4AEAIQMAAAAMACAUAAC8AgAgFQAAxAIAIA0AAAAMACANAADEAgAgdgEA2gEAIXpAANsBACF7QADbAQAhmQEAAKcCpwEingEBANoBACGfAQEA2gEAIaMBAQDaAQAhpAEBAOABACGlASAA7AEAIacBAACoAgAgqAECAKkCACELdgEA2gEAIXpAANsBACF7QADbAQAhmQEAAKcCpwEingEBANoBACGfAQEA2gEAIaMBAQDaAQAhpAEBAOABACGlASAA7AEAIacBAACoAgAgqAECAKkCACEHdgEAAAABeUAAAAABekAAAAABe0AAAAABkQEBAAAAAZIBAQAAAAGTAQEAAAABDHYBAAAAAXpAAAAAAXtAAAAAAYcBAQAAAAGIAQEAAAABigEBAAAAAYsBAQAAAAGMAQEAAAABjQFAAAAAAY4BQAAAAAGPAQEAAAABkAEBAAAAAQsyAACIAgAgdgEAAAABekAAAAABe0AAAAABlAEBAAAAAZUBAQAAAAGWASAAAAABlwEBAAAAAZgBAQAAAAGZAQEAAAABmgEBAAAAAQIAAAA6ACAUAADHAgAgAwAAAEcAIBQAAMcCACAVAADLAgAgDQAAAEcAIA0AAMsCACAyAADuAQAgdgEA2gEAIXpAANsBACF7QADbAQAhlAEBANoBACGVAQEA2gEAIZYBIADsAQAhlwEBAOABACGYAQEA4AEAIZkBAQDgAQAhmgEBAOABACELMgAA7gEAIHYBANoBACF6QADbAQAhe0AA2wEAIZQBAQDaAQAhlQEBANoBACGWASAA7AEAIZcBAQDgAQAhmAEBAOABACGZAQEA4AEAIZoBAQDgAQAhCzEAAIcCACB2AQAAAAF6QAAAAAF7QAAAAAGUAQEAAAABlQEBAAAAAZYBIAAAAAGXAQEAAAABmAEBAAAAAZkBAQAAAAGaAQEAAAABAgAAADoAIBQAAMwCACADAAAARwAgFAAAzAIAIBUAANACACANAAAARwAgDQAA0AIAIDEAAO0BACB2AQDaAQAhekAA2wEAIXtAANsBACGUAQEA2gEAIZUBAQDaAQAhlgEgAOwBACGXAQEA4AEAIZgBAQDgAQAhmQEBAOABACGaAQEA4AEAIQsxAADtAQAgdgEA2gEAIXpAANsBACF7QADbAQAhlAEBANoBACGVAQEA2gEAIZYBIADsAQAhlwEBAOABACGYAQEA4AEAIZkBAQDgAQAhmgEBAOABACECBgAEBwYCBAMAAQQHAgUIAgYAAwEFCQABBwoAAAAABQYACRoAChsACxwADB0ADQAAAAAABQYACRoAChsACxwADB0ADQIDAAEELAICAwABBDICAwYAEhwAEx0AFAAAAAMGABIcABMdABQDBgAZMT8XMkMYATAAFgEwABYCMUQAMkUAAAADBgAdHAAeHQAfAAAAAwYAHRwAHh0AHwEwABYBMAAWAwYAJBwAJR0AJgAAAAMGACQcACUdACYBMAAWATAAFgMGACscACwdAC0AAAADBgArHAAsHQAtAAAAAwYAMxwANB0ANQAAAAMGADMcADQdADUIAgEJCwEKDgELDwEMEAEOEgEPFAUQFQYRFwESGQUTGgcWGwEXHAEYHQUeIAgfIQ4gIgIhIwIiJAIjJQIkJgIlKAImKgUnKw8oLgIpMAUqMRArMwIsNAItNQUuOBEvORUzOxY0RhY1SRY2ShY3SxY4TRY5TwU6UBo7UhY8VAU9VRs-VhY_VxZAWAVBWxxCXCBDXRdEXhdFXxdGYBdHYRdIYxdJZQVKZiFLaBdMagVNayJObBdPbRdQbgVRcSNScidTcxhUdBhVdRhWdhhXdxhYeRhZewVafChbfhhcgAEFXYEBKV6CARhfgwEYYIQBBWGHASpiiAEuY4oBL2SLAS9ljgEvZo8BL2eQAS9okgEvaZQBBWqVATBrlwEvbJkBBW2aATFumwEvb5wBL3CdAQVxoAEycqEBNg"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer: Buffer2 } = await import("buffer");
  const wasmArray = Buffer2.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// generated/prisma/internal/prismaNamespace.ts
var runtime2 = __toESM(require("@prisma/client/runtime/client"));
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var defineExtension = runtime2.Extensions.defineExtension;

// generated/prisma/client.ts
var import_meta = {};
globalThis["__dirname"] = path.dirname((0, import_node_url.fileURLToPath)(import_meta.url));
var PrismaClient = getPrismaClientClass();

// src/lib/prisma.ts
var import_adapter_pg = require("@prisma/adapter-pg");
var adapter = new import_adapter_pg.PrismaPg({ connectionString: process.env.DATABASE_URL });
var prisma = new PrismaClient({ adapter });

// src/modules/post/post.service.ts
var createPost = async (data, authorId) => {
  const result = await prisma.post.create({
    data: {
      ...data,
      authorId
    }
  });
  return result;
};
var getAllPosts = async (payload) => {
  const andOperation = [];
  if (payload.search) {
    andOperation.push({
      OR: [
        {
          title: {
            contains: payload.search,
            mode: "insensitive"
          }
        },
        {
          content: {
            contains: payload.search,
            mode: "insensitive"
          }
        },
        {
          tags: {
            has: payload.search
          }
        }
      ]
    });
  }
  if (payload.tags.length > 0) {
    andOperation.push({
      tags: {
        hasEvery: payload.tags
      }
    });
  }
  if (typeof payload.isFeatured === "boolean") {
    andOperation.push({
      isFeatured: payload.isFeatured
    });
  }
  if (payload.status) {
    andOperation.push({
      status: payload.status
    });
  }
  if (payload.authorId) {
    andOperation.push({
      authorId: payload.authorId
    });
  }
  const result = await prisma.post.findMany({
    take: payload.limit,
    skip: payload.skip,
    where: {
      AND: andOperation
    },
    orderBy: {
      [payload.sortBy]: payload.orderBy
    }
  });
  const total = await prisma.post.count({
    where: {
      AND: andOperation
    }
  });
  return {
    data: result,
    pagination: total,
    page: payload.page,
    limit: payload.limit,
    totalPage: Math.ceil(payload.page / payload.limit)
  };
};
var getPostById = async (postId) => {
  return await prisma.$transaction(async (tx) => {
    await tx.post.update({
      where: {
        id: postId
      },
      data: {
        view: {
          increment: 1
        }
      }
    });
    const post = await tx.post.findUnique({
      where: { id: postId }
    });
    return post;
  });
};
var PostService = {
  createPost,
  getAllPosts,
  getPostById
};

// src/helper/paginationSortingHelper.ts
var paginationSortingHelper = (options) => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const skip = (page - 1) * limit;
  const sortBy = options.sortBy || "createdAt";
  const orderBy = options.orderBy || "desc";
  return {
    page,
    limit,
    skip,
    sortBy,
    orderBy
  };
};
var paginationSortingHelper_default = paginationSortingHelper;

// src/modules/post/post.controller.ts
var createPost2 = async (req, res) => {
  console.log(req.user);
  try {
    const user = req.user;
    if (!user) {
      return res.status(400).json({
        error: "unauthorized user!"
      });
    }
    const result = await PostService.createPost(req.body, user.id);
    res.status(201).json(result);
  } catch (error) {
    console.log("Full Error ", error);
    res.status(400).json({
      error: "Post created failed",
      details: error
    });
  }
};
var getAllPost = async (req, res) => {
  try {
    const { search } = req.query;
    const searchPost = typeof search === "string" ? search : void 0;
    const tags = req.query.tags ? req.query.tags.split(",") : [];
    const isFeatured = req.query.isFeatured ? req.query.isFeatured === "true" ? true : req.query.isFeatured === "false" ? false : void 0 : void 0;
    const status = req.query.status;
    const authorId = req.query.authorId;
    const { page, limit, skip, sortBy, orderBy } = paginationSortingHelper_default(
      req.query
    );
    const result = await PostService.getAllPosts({
      search: searchPost,
      tags,
      isFeatured,
      status,
      authorId,
      page,
      limit,
      skip,
      sortBy,
      orderBy
    });
    res.status(200).json(result);
  } catch (error) {
    console.log("Full Error ", error);
    res.status(400).json({
      error: "Get pots failed",
      details: error
    });
  }
};
var getPostById2 = async (req, res) => {
  try {
    const { postId } = req.params;
    if (!postId || Array.isArray(postId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post id"
      });
    }
    const result = await PostService.getPostById(postId);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }
    res.status(200).json({
      success: true,
      message: "Post retrieved successfully",
      data: result
    });
  } catch (error) {
    console.log("Full Error ", error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Get post failed"
    });
  }
};
var PostController = {
  createPost: createPost2,
  getAllPost,
  getPostById: getPostById2
};

// src/lib/auth.ts
var import_better_auth = require("better-auth");
var import_prisma2 = require("better-auth/adapters/prisma");
var import_nodemailer = __toESM(require("nodemailer"));
var transporter = import_nodemailer.default.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
var auth = (0, import_better_auth.betterAuth)({
  database: (0, import_prisma2.prismaAdapter)(prisma, {
    provider: "postgresql"
    // or "mysql", "postgresql", ...etc
  }),
  trustedOrigins: [process.env.APP_URL],
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "USER",
        required: false
      },
      status: {
        type: "string",
        defaultValue: "ACTIVE",
        required: false
      },
      phone: {
        type: "string",
        required: false
      }
    }
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      accessType: "offline",
      prompt: "select_account consent"
    }
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      try {
        const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;
        const info = await transporter.sendMail({
          from: '"Prisma Blog" <prismabloge@db.com>',
          to: user.email,
          subject: "Verify Your Email - Prisma Blog",
          text: `Please verify your email by clicking this link: ${verificationUrl}`,
          html: `
    <div style="margin:0; padding:40px 20px; background-color:#f4f7fb; font-family:Arial, Helvetica, sans-serif;">
      <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden;">

        <div style="background:#2563eb; padding:30px 20px; text-align:center;">
          <h1 style="margin:0; color:#ffffff;">
            Prisma Blog
          </h1>
        </div>

        <div style="padding:40px 30px; text-align:center;">

          <h2 style="color:#1f2937;">
            Verify Your Email Address
          </h2>

          <p style="color:#6b7280; font-size:16px; line-height:1.6;">
            Thanks for creating an account with Prisma Blog!
            Please verify your email address by clicking the button below.
          </p>

          <a
            href="${verificationUrl}"
            style="
              display:inline-block;
              padding:14px 28px;
              background:#2563eb;
              color:#ffffff;
              text-decoration:none;
              font-size:16px;
              font-weight:bold;
              border-radius:8px;
            "
          >
            Verify My Email
          </a>

          <p style="margin-top:30px; color:#9ca3af; font-size:13px;">
            If you didn't create this account, you can safely ignore this email.
          </p>

        </div>

        <div style="padding:20px; background:#f9fafb; text-align:center;">
          <p style="margin:0; color:#9ca3af; font-size:13px;">
            \xA9 2026 Prisma Blog. All rights reserved.
          </p>
        </div>

      </div>
    </div>
  `
        });
        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", import_nodemailer.default.getTestMessageUrl(info));
      } catch (err) {
        console.error("Error while sending mail:", err);
      }
    }
  }
});

// src/middlewares/auth.ts
var authHeder = (...roles) => {
  return async (req, res, next) => {
    try {
      const session = await auth.api.getSession({
        headers: req.headers
      });
      if (!session) {
        return res.status(401).json({
          success: false,
          message: "You are unauthorized"
        });
      }
      if (!session.user.emailVerified) {
        return res.status(403).json({
          success: false,
          message: "Email Verification required, Please verify your emil!"
        });
      }
      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        emailVerification: session.user.emailVerified
      };
      if (!roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden! You are don't access this resources."
        });
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
var auth_default = authHeder;

// src/modules/post/post.router.ts
var router = import_express.default.Router();
router.post("/", auth_default("USER" /* USER */), PostController.createPost);
router.get("/", PostController.getAllPost);
router.get("/:postId", PostController.getPostById);
var post_router_default = router;

// src/app.ts
var import_cors = __toESM(require("cors"));
var app = (0, import_express2.default)();
app.use(import_express2.default.json());
app.use(
  (0, import_cors.default)({
    origin: process.env.APP_URL || "http//localhost:4000",
    credentials: true
  })
);
app.use("/post", post_router_default);
app.use("/getAllPosts", post_router_default);
app.get("/", (req, res) => {
  res.send("Bismillahir Rahmanir Rahim");
});
var app_default = app;

// src/server.ts
var PORT = process.env.PORT || 5e3;
async function main() {
  try {
    await prisma.$connect();
    console.log("Connected to DATABASE Successfully");
    app_default.all("/api/auth/*splat", (0, import_node.toNodeHandler)(auth));
    app_default.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("an error occurred", error);
    await prisma.$disconnect;
    process.exit(1);
  }
}
main();
