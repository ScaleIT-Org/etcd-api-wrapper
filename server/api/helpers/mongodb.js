"use strict";
/*******************************************************************
 *   mongodb/controller.js
 *******************************************************************/
const logger = require('./../../lib/logger')('mongodb.js');
const controller = this;
const errors = require("./errors");
const mongooseHelper = require("./mongoose");

controller.invokeFunction = async function (req, res, functionName, next) {
     try {
          let result = await controller[functionName](req.params.objectType, req.body, req.query, req.params.id);
          //override empty body
          if (req.method !== "GET" && typeof(req.query.body) === "string" && req.query.body === "false") {
               result = undefined;
          }
          res.status(200).json(result);
     } catch (error) {
          next(error);
     }
};

controller.getObjects = async function (type, payload, query) {
     let kind = payload && payload.kind ? payload.kind : type;
     let descriptor = mongooseHelper.getDescriptor(kind);
     let schema = mongooseHelper.getSchema(type);
     let limit = query && query.limit > 0 ? query.limit : 0;
     let skip = limit > 0 && query.skip > 0 ? (query.skip - 1) * limit : 0;
     let findQuery = getFindQuery(query);
     let projection = getProjection(query);
     let populateOptions = getPopulateOptions(descriptor, query);
     let objects;
     if (descriptor["mongoose:plugin"] === "i18n") {
          let lang = query && query.lang ? query.lang : "de";
          objects = await schema.find(findQuery, projection)
               .skip(skip)
               .limit(limit)
               .populate(populateOptions)
               .exec();
          objects = schema.schema.methods.toJSONLocalizedOnly(objects, lang);
     } else {
          objects = await schema.find(findQuery, projection)
               .skip(skip)
               .limit(limit)
               .populate(populateOptions)
               .lean()
               .exec();
     }
     return objects
};

controller.getObjectById = async function (type, payload, query, id) {
     let kind = payload && payload.kind ? payload.kind : type;
     let descriptor = mongooseHelper.getDescriptor(kind);
     let schema = mongooseHelper.getSchema(type);
     let projection = getProjection(query);
     let populateOptions = getPopulateOptions(descriptor, query);
     let object;
     if (descriptor["mongoose:plugin"] === "i18n") {
          let lang = query && query.lang ? query.lang : "de";
          object = await schema.findById(id, projection)
               .populate(populateOptions)
               .exec();
          object = schema.schema.methods.toJSONLocalizedOnly(object, lang);
     } else {
          object = await schema.findById(id, projection)
               .populate(populateOptions)
               .lean()
               .exec();
     }
     return object;
};

controller.createObject = async function (type, payload, query) {
     let kind = payload && payload.kind ? payload.kind : type;
     let schema = mongooseHelper.getSchema(kind);
     let descriptor = mongooseHelper.getDescriptor(kind);
     //remove kind otherwise mongoose create call will fail
     if (payload.kind) {
          delete payload.kind;
     }
     //create all implicit properties
     if (descriptor["mongoose:implicit"] && Array.isArray(descriptor["mongoose:implicit"])) {
          for (let key of descriptor["mongoose:implicit"]) {
               let savedProperty = await controller.createObject(mongooseHelper.getPropertySchema(descriptor, key)["mongoose:ref"], payload[key]);
               payload[key] = savedProperty._id;
          }
     }
     let objectModel = new schema(payload);
     let createdObject = await objectModel.save();
     let populatedObject = await controller.getObjectById(type, payload, query, createdObject._id);
     return populatedObject;
};

controller.updateObject = async function (type, payload, query, id) {
     let kind = payload && payload.kind ? payload.kind : type;
     let objectId = payload && payload._id ? payload._id : id;
     let schema = mongooseHelper.getSchema(kind);
     let descriptor = mongooseHelper.getDescriptor(kind);
     //remove kind otherwise mongoose update call will fail
     if (payload.kind) {
          delete payload.kind;
     }
     //update all implicit properties
     if (descriptor["mongoose:implicit"] && Array.isArray(descriptor["mongoose:implicit"])) {
          for (let key of descriptor["mongoose:implicit"]) {
               let updatedProperty = await controller.updateObject(mongooseHelper.getPropertySchema(descriptor, key)["mongoose:ref"], payload[key]);
               payload[key] = updatedProperty._id;
          }
     }

     let object = await schema.findOne({"_id": objectId}).exec();
     if (object) {
          let updates = false;
          for (let key in payload) {
               if (key === "refId") {
                    let objectId = object[key].toString();
                    if (objectId !== payload[key]) {
                         object[key] = mongooseHelper.castToObjectId(payload[key]);
                         logger.debug("Updating " + key + " to " + payload[key] + "!");
                         updates = true;
                    }
               } else if (key !== "_id" && key !== "updatedAt" && key !== "createdAt") {
                    //check if key is defined in descriptor
                    if (object[key] !== payload[key]) {
                         logger.debug("Updating " + key + " from " + object[key] + " to " + payload[key] + "!");
                         object[key] = payload[key];
                         updates = true;
                    }
               }
          }
          if (!updates) {
               throw new errors.BadRequestError("Nothing to update!");
          }
     } else {
          throw new errors.NotFoundError("Cannot update object since " + type + " with id " + objectId + " was not found!", "NotFoundError");
     }
     let updatedObject = await object.save();
     let populatedObject = await controller.getObjectById(type, payload, query, updatedObject._id);
     return populatedObject;
};

controller.deleteAllObjects = async function (type) {
     let allObjects = await controller.getObjects(type);
     let deletedObjects = [];
     for (let object of allObjects) {
          try {
               let deletedObject = await controller.deleteObject(type, object);
               deletedObjects.push(deletedObject);
          } catch (error) {
               logger.warn(error);
          }
     }
     return deletedObjects;
};

controller.deleteObject = async function (type, payload, query, id) {
     let kind = payload && payload.kind ? payload.kind : type;
     let objectId = payload && payload._id ? payload._id : id;
     let schema = mongooseHelper.getSchema(kind);
     let descriptor = mongooseHelper.getDescriptor(kind);
     //remove kind otherwise mongoose delete call will fail
     if (payload && payload.kind) {
          delete payload.kind;
     }
     //delete all implicit properties
     if (descriptor["mongoose:implicit"] && Array.isArray(descriptor["mongoose:implicit"])) {
          for (let key of descriptor["mongoose:implicit"]) {
               controller.deleteObject(mongooseHelper.getPropertySchema(descriptor, key)["mongoose:ref"], payload[key]);
          }
     }
     //delete all objects that refer to the object
     if (descriptor["mongoose:referencedBy"] && Array.isArray(descriptor["mongoose:referencedBy"])) {
          for (let key of descriptor["mongoose:referencedBy"]) {
               let referencedItems = await controller.getObjects(key, null, {find: {refId: objectId}});
               for (let referencedItem of referencedItems) {
                    controller.deleteObject(key, referencedItem);
               }
          }
     }
     let deletedObject = await schema.findOneAndRemove({"_id": objectId}).exec();
     if (!deletedObject) {
          throw new errors.NotFoundError("Cannot delete object since " + type + " with id " + objectId + " was not found!", "NotFoundError");
     }
     logger.debug("[deleteObject]", deletedObject);
     return deletedObject;
};

module.exports = controller;

function getFindQuery(query) {
     let findQuery = {};
     if (query && query.find) {
          if (typeof  query.find === "string") {
               findQuery = JSON.parse(query.find);
          } else {
               findQuery = query.find;
          }
     }
     return findQuery;
}

function getProjection(query) {
     let projection = {};
     //override object properties
     if (query && query.properties) {
          let properties = query.properties.split(',');
          for (let property of properties) {
               projection[property] = 1;
          }
     }
     //override excluded object properties
     if (query && query.excludedProperties) {
          let excludedProperties = query.excludedProperties.split(',');
          for (let property of excludedProperties) {
               projection[property] = 0;
          }
     }
     return projection;
}

function getPopulateOptions(descriptor, query) {
     let populateOptions = '';
     if (query && query.populate) {
          populateOptions = query.populate + ' ';
     }
     if (descriptor["mongoose:populate"] && Array.isArray(descriptor["mongoose:populate"])) {
          for (let key of descriptor["mongoose:populate"]) {
               populateOptions += key + ' ';
          }
     }
     if (populateOptions) {
          logger.debug("[getPopulateOptions]", populateOptions);
     }
     return populateOptions;
}