// Browser and Node shared fixtures for the `gpii.pouch` PouchDB component tests.
/* eslint-env node */
"use strict";
var fluid  = fluid || require("infusion");
var gpii   = fluid.registerNamespace("gpii");
var jqUnit = jqUnit || require("node-jqunit");

if (!gpii.pouch) {
    require("../../../")
    gpii.pouch.loadTestingSupport();
}

fluid.registerNamespace("gpii.tests.pouchdb.component");
gpii.tests.pouchdb.component.wtf = function () {
    console.log("yo");
};

fluid.defaults("gpii.tests.pouchdb.component.caseHolder", {
    gradeNames: ["gpii.test.express.caseHolder.base"],
    inputs: {
        bulkData: [
            {
                "_id": "one",
                "saying": "is the loneliest number"
            },
            {
                "_id": "two",
                "saying": "are required to tango"
            }
        ]
    },
    expectedResponses: {
        bulkCreate: [{ ok: true, id: "one"}, { ok: true, id: "two"}]
    },
    // Recreate the database before each test.
    sequenceStart: [{
        func: "{testEnvironment}.events.constructFixtures.fire"
    }],
    // Destroy the database after each test.
    sequenceEnd:   [
        {
            func: "{testEnvironment}.pouchDb.destroyPouch"
        },
        {
            event:    "{testEnvironment}.pouchDb.events.onDestroyPouchComplete",
            listener: "jqUnit.assertLeftHand",
            args:     ["The database should be destroyed on test completion...", { ok: true}, "{arguments}.0"]
        }
    ],
    rawModules: [{
        name: "Tests for `gpii.pouch` component...",
        type: "test",
        tests: [
            {
                name: "Test the info method...",
                sequence: [
                    {
                        func: "{testEnvironment}.pouchDb.info"
                    },
                    {
                        event:    "{testEnvironment}.pouchDb.events.onInfoComplete",
                        listener: "jqUnit.assertLeftHand",
                        args:     ["The database info should be as expected...", { db_name: "test", doc_count: 0, update_seq: 0}, "{arguments}.0"]
                    }
                ]
            },
            {
                name: "Test the `POST` method (with an ID)...",
                sequence: [
                    {
                        func: "{testEnvironment}.pouchDb.post",
                        args: [{ _id: "foo"}]
                    },
                    {
                        event: "{testEnvironment}.pouchDb.events.onPostComplete",
                        listener: "jqUnit.assertLeftHand",
                        args: ["The POST should have been successful...", { ok: true, id: "foo"}, "{arguments}.0"]
                    }
                ]
            },
            {
                name: "Test the `PUT` method (with an ID)...",
                sequence: [
                    {
                        func: "{testEnvironment}.pouchDb.post",
                        args: [{ _id: "bar"}]
                    },
                    {
                        event: "{testEnvironment}.pouchDb.events.onPostComplete",
                        listener: "jqUnit.assertLeftHand",
                        args: ["The PUT should have been successful...", { ok: true, id: "bar"}, "{arguments}.0"]
                    }
                ]
            },
            {
                name: "Test the `POST` method (without an ID)...",
                sequence: [
                    {
                        func: "{testEnvironment}.pouchDb.post",
                        args: [{ "onions": "raw" }]
                    },
                    {
                        event: "{testEnvironment}.pouchDb.events.onPostComplete",
                        listener: "{testEnvironment}.pouchDb.get",
                        args: ["{arguments}.0.id"]
                    },
                    {
                        event: "{testEnvironment}.pouchDb.events.onGetComplete",
                        listener: "jqUnit.assertLeftHand",
                        args: ["The record should have been POSTed...", { "onions": "raw"}, "{arguments}.0"]
                    }
                ]
            },
            {
                name: "Test the bulkDocs function...",
                sequence: [
                    {
                        func: "{testEnvironment}.pouchDb.bulkDocs",
                        args: ["{that}.options.inputs.bulkData"]
                    },
                    {
                        event:    "{testEnvironment}.pouchDb.events.onBulkDocsComplete",
                        listener: "gpii.test.pouchdb.recordsAreEquivalent",
                        args:     ["The bulk creation of documents should have been successful...", "{that}.options.expectedResponses.bulkCreate", "{arguments}.0"]
                    }
                ]
            },
            {
                name: "Test the allDocs function...",
                sequence: [
                    {
                        func: "{testEnvironment}.pouchDb.bulkDocs",
                        args: ["{that}.options.inputs.bulkData"]
                    },
                    {
                        event:    "{testEnvironment}.pouchDb.events.onBulkDocsComplete",
                        listener: "{testEnvironment}.pouchDb.allDocs",
                        args:     []
                    },
                    {
                        event:    "{testEnvironment}.pouchDb.events.onAllDocsComplete",
                        listener: "jqUnit.assertLeftHand",
                        args:     ["The bulk retrieval of all documents should return the correct number of records...", { offset: 0, total_rows: 2 }, "{arguments}.0"]
                    }
                ]
            },
            {
                name: "Test the bulkGet function...",
                sequence: [
                    {
                        func: "{testEnvironment}.pouchDb.bulkDocs",
                        args: ["{that}.options.inputs.bulkData"]
                    },
                    {
                        event:    "{testEnvironment}.pouchDb.events.onBulkDocsComplete",
                        listener: "{testEnvironment}.pouchDb.bulkGet",
                        args:     [{ docs: [{ id: "one" }, { id: "two"}]}]
                    },
                    {
                        event:    "{testEnvironment}.pouchDb.events.onBulkGetComplete",
                        listener: "gpii.test.pouchdb.recordsAreEquivalent",
                        args:     ["a bulk get of all documents should return the correct content...", [{ id: "one" }, { id: "two"}], "{arguments}.0.results"]
                    }
                ]
            },
            {
                name: "Test the remove function...",
                sequence: [
                    {
                        func: "{testEnvironment}.pouchDb.bulkDocs",
                        args: ["{that}.options.inputs.bulkData"]
                    },
                    {
                        event:    "{testEnvironment}.pouchDb.events.onBulkDocsComplete",
                        listener: "{testEnvironment}.pouchDb.get",
                        args:     ["two"]
                    },
                    {
                        event:    "{testEnvironment}.pouchDb.events.onGetComplete",
                        listener: "{testEnvironment}.pouchDb.remove",
                        args:     ["{arguments}.0"]
                    },
                    {
                        event:    "{testEnvironment}.pouchDb.events.onRemoveComplete",
                        listener: "{testEnvironment}.pouchDb.info",
                        args:     []
                    },
                    {
                        event:    "{testEnvironment}.pouchDb.events.onInfoComplete",
                        listener: "jqUnit.assertLeftHand",
                        args:     ["The database should now only contain one record...", { db_name: "test", doc_count: 1 }, "{arguments}.0"]
                    }
                ]
            }
        ]
    }]
});

fluid.defaults("gpii.tests.pouchdb.component.environment", {
    gradeNames: ["fluid.test.testEnvironment"],
    events: {
        constructFixtures: null
    },
    components: {
        pouchDb: {
            type: "gpii.pouch",
            createOnEvent: "constructFixtures",
            options: {
                dbOptions: {
                    name: "test"
                }
            }
        },
        caseHolder: {
            type: "gpii.tests.pouchdb.component.caseHolder"
        }
    }
});

fluid.test.runTests("gpii.tests.pouchdb.component.environment");

/*
 // TODO:  Test each of these

 compact: {
 funcName: "gpii.pouch.callPouchFunction",
 args: ["compact", "{arguments}", "onCompactComplete"] // fnName, fnArgs, eventName
 },

 getAttachment: {
 funcName: "gpii.pouch.callPouchFunction",
 args: ["getAttachment", "{arguments}", "onGetAttachmentComplete"] // fnName, fnArgs, eventName
 },

 putAttachment: {
 funcName: "gpii.pouch.callPouchFunction",
 args: ["putAttachment", "{arguments}", "onPutAttachmentComplete"] // fnName, fnArgs, eventName
 },
 query: {
 funcName: "gpii.pouch.callPouchFunction",
 args: ["query", "{arguments}", "onQueryComplete"] // fnName, fnArgs, eventName
 },
 remove: {
 funcName: "gpii.pouch.callPouchFunction",
 args: ["remove", "{arguments}", "onRemoveComplete"] // fnName, fnArgs, eventName
 },
 removeAttachment: {
 funcName: "gpii.pouch.callPouchFunction",
 args: ["removeAttachment", "{arguments}", "onRemoveAttachmentComplete"] // fnName, fnArgs, eventName
 },
 viewCleanup: {
 funcName: "gpii.pouch.callPouchFunction",
 args: ["viewCleanup", "{arguments}", "onViewCleanupComplete"] // fnName, fnArgs, eventName
 }

 // TODO: The change listeners fire too quickly, we need another way to test them.
 */