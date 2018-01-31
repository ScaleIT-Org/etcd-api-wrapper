"use strict";
/*******************************************************************
 *   mongoose.js
 *******************************************************************/
const logger = require('./../../lib/logger')('mongoose.js');
const errors = require("./errors");
const _ = require('lodash');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const mongooseHelper = this;

let descriptors = {};
let schemas = {};

mongooseHelper.registerSchemas = function (schemaDirectory, yml2js, discriminatorKey, appName) {
     try {
          let files = fs.readdirSync(schemaDirectory);
          files.map(function (file) {
               return path.join(schemaDirectory, file);
          }).filter(function (file) {
               return fs.statSync(file).isFile() && path.extname(file) === yml2js ? ".yaml" : ".json";
          }).filter(function (file) {
               let descriptor = yml2js ? require('yamljs').load(file) : fs.readFileSync(file);
               let source = descriptor["scaleit:source"];
               return !source || source === appName;
          }).sort(function (a, b) {
               let camelA = _.camelCase(a);
               let camelB = _.camelCase(b);
               return camelA.localeCompare(camelB);
          }).forEach(function (file) {
               try {
                    let filename = path.basename(file, yml2js ? ".yaml" : ".json");
                    let descriptor = yml2js ? require('yamljs').load(file) : fs.readFileSync(file);
                    let mongooseSchema = extractMongooseSchema(descriptor);
                    let options = {};
                    options.discriminatorKey = discriminatorKey ? discriminatorKey : "kind";
                    let object;
                    if (descriptor["mongoose:options"]) {
                         options = Object.assign(options, descriptor["mongoose:options"]);
                    }
                    let objectSchema = new mongoose.Schema(mongooseSchema, options);
                    addControllerFunctions(descriptor, objectSchema);
                    if (descriptor["mongoose:plugin"] === "i18n") {
                         const mongooseI18n = require('mongoose-i18n-localize');
                         objectSchema.plugin(mongooseI18n, {
                              locales: ['en', 'de']
                         });
                    }
                    if (descriptor["mongoose:discriminator"]) {
                         let discriminatorSchema = schemas[descriptor["mongoose:discriminator"]];
                         let discriminatorDescriptor = Object.assign({}, descriptors[descriptor["mongoose:discriminator"]]);
                         descriptor = Object.assign(discriminatorDescriptor, descriptor); //merge descriptor
                         object = discriminatorSchema.discriminator(filename, objectSchema);
                    } else {
                         object = mongoose.model(filename, objectSchema);
                    }
                    descriptors[filename] = descriptor;
                    schemas[filename] = object;
                    logger.info("Successfully initialized %s!", filename);
               } catch (error) {
                    logger.error(error.message);
                    logger.silly(error);
               }
          });
     } catch (error) {
          logger.error(error.message);
          logger.silly(error);
     }
};

mongooseHelper.getSchema = function (type) {
     let schema = schemas[type];
     if (!schema) {
          throw new errors.NotFoundError("There is no schema " + type + " defined in local database! ");
     }
     return schema;
};

mongooseHelper.getDescriptor = function (type) {
     let descriptor = descriptors[type];
     if (!descriptor) {
          throw new errors.NotFoundError("Cannot get descriptor of " + type + "!");
     }
     return descriptor;
};

mongooseHelper.castToObjectId = function (id) {
     return mongoose.Types.ObjectId(id);
};

mongooseHelper.getPropertySchema = function (schema, key) {
     let objectDescriptor = getObjectDefinition(schema);
     if (!objectDescriptor || !objectDescriptor.properties) {
          throw new errors.NotFoundError("Cannot get property schema of " + key);
     }
     return objectDescriptor.properties[key];
};

module.exports = mongooseHelper;

function extractMongooseSchema(schema) {
     let mongooseSchema = {};
     let objectDefinition = getObjectDefinition(schema);
     for (let key in objectDefinition.properties) {
          let property = objectDefinition.properties[key];
          try {
               if (!property["mongoose:skipInSchemaDefinition"]) {
                    if (!property.type || property.type === "object") {
                         mongooseSchema[key] = extractMongooseSchemaOfObject(property, schema);
                    } else if (property.type === "array") {
                         mongooseSchema[key] = [];
                         if (property.items) {
                              if (property.items.type === "object") {
                                   mongooseSchema[key][0] = extractMongooseSchemaOfObject(property, schema);
                              } else if (property.items.type === "string") {
                                   mongooseSchema[key][0] = {};
                                   if (property.items.format === "uri") {
                                        mongooseSchema[key][0].type = mongoose.Schema.Types.ObjectId;
                                        mongooseSchema[key][0].ref = property["mongoose:ref"];
                                   } else {
                                        mongooseSchema[key][0].type = String;
                                   }
                              } else if (property.items.type === "number" || property.items.type === "integer") {
                                   mongooseSchema[key][0] = {};
                                   mongooseSchema[key][0].type = Number;
                              }
                         } else {
                              throw new Error("items not defined for type array!");
                         }
                    } else if (property.type === "string") {
                         mongooseSchema[key] = {};
                         mongooseSchema[key].type = getMongooseSchemaType(property);
                         mongooseSchema[key].required = isRequired(objectDefinition, key);
                         if (property.format === "uri") {
                              mongooseSchema[key].ref = property["mongoose:ref"];
                         }
                         if (property.enum) {
                              mongooseSchema[key].enum = property.enum;
                         }
                         if (property.default) {
                              mongooseSchema[key].default = property.default;
                         }
                         if (property.minLength) {
                              mongooseSchema[key].minlength = property.minLength;
                         }
                         if (property.maxLength) {
                              mongooseSchema[key].maxlength = property.maxLength;
                         }
                         if (property.pattern) {
                              mongooseSchema[key].match = new RegExp(property.pattern)
                         }
                         if (property["mongoose:index"]) {
                              mongooseSchema[key].index = true;
                         }
                         if (property["mongoose:unique"]) {
                              mongooseSchema[key].unique = true;
                         }
                         if (property["mongoose:i18n"]) {
                              mongooseSchema[key].i18n = true;
                         }
                    } else if (property.type === "integer" || property.type === "number") {
                         mongooseSchema[key] = {};
                         mongooseSchema[key].type = getMongooseSchemaType(property);
                         mongooseSchema[key].required = isRequired(objectDefinition, key);
                         if (property.minimum) {
                              mongooseSchema[key].min = property.min;
                         }
                         if (property.maximum) {
                              mongooseSchema[key].max = property.max;
                         }
                         if (property.exclusiveMinimum) {
                              mongooseSchema[key].validate = value => exclusiveMinimumValidator(value, property.minimum);
                         }
                         if (property.exclusiveMaximum) {
                              mongooseSchema[key].validate = value => exclusiveMaximumValidator(value, property.maximum);
                         }
                         if (property.multipleOf) {
                              mongooseSchema[key].validate = value => multipleOfValidator(value, property.multipleOf);
                         }
                    } else if (property.type === "boolean") {
                         mongooseSchema[key] = {};
                         mongooseSchema[key].type = getMongooseSchemaType(property);
                    }
               }
          } catch (error) {
               logger.error(error);
          }
     }
     return mongooseSchema;
}

function extractMongooseSchemaOfObject(property, schema) {
     let mongooseSchema = {};
     let subSchema;
     if (property["$ref"]) {
          subSchema = Object.assign({}, getSchemaReference(property["$ref"], schema));
          subSchema.definitions = schema.definitions;
          mongooseSchema = extractMongooseSchema(subSchema);
     } else if (property.properties) {
          subSchema = Object.assign({}, property);
          subSchema.definitions = schema.definitions;
          mongooseSchema = extractMongooseSchema(subSchema);
     } else {
          if (property.minProperties) {
               //TODO implement custom validator
          }
          if (property.maxProperties) {
               //TODO implement custom validator
          }
          if (property.dependencies) {
               //TODO handle dependencies
          }
     }
     return mongooseSchema;
}

function addControllerFunctions(descriptor, schema) {
     if (descriptor["mongoose:controller"]) {
          let controller = require(descriptor["mongoose:controller"]);
          controller.init(schema);
     }
}

function getObjectDefinition(schema) {
     let objectDefinition = schema;
     if (schema["mongoose:object"]) {
          for (let key of schema["mongoose:object"]) {
               objectDefinition = objectDefinition[key];
          }
     }
     return objectDefinition;
}

function getSchemaReference($ref, schema) {
     let schemaReference = schema;
     if ($ref && typeof $ref === "string") {
          let link = $ref.split("/");
          for (let key of link) {
               if (key !== "#") {
                    schemaReference = schemaReference[key];
               }
          }
     }
     return schemaReference;
}

function getMongooseSchemaType(property) {
     let schemaType;
     if (property.type === "string" && !property.format) {
          schemaType = String;
     } else if (property.type === "string" && property.format === "uri") {
          schemaType = mongoose.Schema.Types.ObjectId;
     } else if (property.type === "string" && property.format === "hostname") {
          schemaType = String;
     } else if (property.type === "string" && property.format === "date-time") {
          schemaType = Date;
     } else if (property.type === "number" || property.type === "integer") {
          schemaType = Number;
     } else if (property.type === "boolean") {
          schemaType = Boolean;
     } else if (property.type === "object") {
          schemaType = mongoose.Schema.Types.Mixed;
     } else {
          throw new Error("unknown type: " + property.type);
     }
     return schemaType;
}

function isRequired(objectDefinition, key) {
     let required = false;
     if (objectDefinition.required && Array.isArray(objectDefinition.required) && objectDefinition.required.length > 0) {
          required = objectDefinition.required.includes(key);
     }
     return required;
}

function multipleOfValidator(value, multipleOf) {
     return value % multipleOf === 0;
}

function exclusiveMinimumValidator(value, minimum) {
     return value > minimum;
}

function exclusiveMaximumValidator(value, maximum) {
     return value < maximum;
}