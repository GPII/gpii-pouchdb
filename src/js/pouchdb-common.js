/*

    Provide a component that wraps an individual PouchDB instance.

    https://github.com/fluid-project/fluid-pouchdb/blob/main/docs/pouchdb.md

 */
/* eslint-env node */
"use strict";
var fluid = fluid || require("infusion");

var PouchDB = PouchDB || require("pouchdb");

fluid.registerNamespace("fluid.pouch");

fluid.pouch.init = function (that) {
    that.pouchDb = new PouchDB(fluid.copy(that.options.dbOptions));
    fluid.log(fluid.logLevel.TRACE, "Pouch instance `" + that.options.dbOptions.name + "` (" + that.id + ") initialized...");
};

/**
 *
 * Call an underlying PouchDb function and fire the named function on completion.
 *
 * @param {Object} that - The component itself.
 * @param {String} fnName - The name of the PouchDB function to call.
 * @param {Array} fnArgs - The arguments (minus the final callback) to pass to the function.
 * @param {String} eventName - The event to fire on completion.
 * @return {Promise} - A promise that will be resolved with the succesful result of executing the function or rejected if an error occurs.
 *
 */
fluid.pouch.callPouchFunction = function (that, fnName, fnArgs, eventName) {
    var promise = fluid.promise();

    var wrappedCallback = function (err, results) {
        if (err) {
            promise.reject(err);
            that.events.onError.fire(err);
        }
        else {
            promise.resolve(results);
            that.events[eventName].fire(results);
        }
    };

    // Add the event firer callback to the list of arguments as the final argument.  If there are no args, we create
    // an empty array first.
    var fullArgs = fluid.makeArray(fnArgs).concat(wrappedCallback);
    that.pouchDb[fnName].apply(that.pouchDb, fullArgs);

    return promise;
};

fluid.defaults("fluid.pouch", {
    gradeNames: ["fluid.component"],
    dbOptions: {
        skip_setup: true
    },
    events: {
        onAllDocsComplete: null,
        onBulkDocsComplete: null,
        onBulkGetComplete: null,
        onCloseComplete: null,
        onCompactComplete: null,
        onCleanupComplete: null,
        onError: null,
        onGetComplete: null,
        onGetAttachmentComplete: null,
        onInfoComplete: null,
        onPouchDestroyComplete: null,
        onPostComplete: null,
        onPutComplete: null,
        onPutAttachmentComplete: null,
        onQueryComplete: null,
        onRemoveComplete: null,
        onRemoveAttachmentComplete: null,
        onViewCleanupComplete: null
    },
    invokers: {
        allDocs: {
            funcName: "fluid.pouch.callPouchFunction",
            args: ["{that}", "allDocs", "{arguments}", "onAllDocsComplete"] // fnName, fnArgs, eventName
        },
        bulkDocs: {
            funcName: "fluid.pouch.callPouchFunction",
            args: ["{that}", "bulkDocs", "{arguments}", "onBulkDocsComplete"] // fnName, fnArgs, eventName
        },
        bulkGet: {
            funcName: "fluid.pouch.callPouchFunction",
            args: ["{that}", "bulkGet", "{arguments}", "onBulkGetComplete"] // fnName, fnArgs, eventName
        },
        compact: {
            funcName: "fluid.pouch.callPouchFunction",
            args: ["{that}", "compact", "{arguments}", "onCompactComplete"] // fnName, fnArgs, eventName
        },
        close: {
            funcName: "fluid.pouch.callPouchFunction",
            args: ["{that}", "close", "{arguments}", "onCloseComplete"] // fnName, fnArgs, eventName
        },
        destroyPouch: {
            funcName: "fluid.pouch.callPouchFunction",
            args: ["{that}", "destroy", "{arguments}", "onPouchDestroyComplete"] // fnName, fnArgs, eventName
        },
        get: {
            funcName: "fluid.pouch.callPouchFunction",
            args: ["{that}", "get", "{arguments}", "onGetComplete"] // fnName, fnArgs, eventName
        },
        getAttachment: {
            funcName: "fluid.pouch.callPouchFunction",
            args: ["getAttachment", "{arguments}", "onGetAttachmentComplete"] // fnName, fnArgs, eventName
        },
        info: {
            funcName: "fluid.pouch.callPouchFunction",
            args: ["{that}", "info", "{arguments}", "onInfoComplete"] // fnName, fnArgs, eventName
        },
        post: {
            funcName: "fluid.pouch.callPouchFunction",
            args: ["{that}", "post", "{arguments}", "onPostComplete"] // fnName, fnArgs, eventName
        },
        put: {
            funcName: "fluid.pouch.callPouchFunction",
            args: ["{that}", "put", "{arguments}", "onPutComplete"] // fnName, fnArgs, eventName
        },
        putAttachment: {
            funcName: "fluid.pouch.callPouchFunction",
            args: ["{that}", "putAttachment", "{arguments}", "onPutAttachmentComplete"] // fnName, fnArgs, eventName
        },
        query: {
            funcName: "fluid.pouch.callPouchFunction",
            args: ["{that}", "query", "{arguments}", "onQueryComplete"] // fnName, fnArgs, eventName
        },
        remove: {
            funcName: "fluid.pouch.callPouchFunction",
            args: ["{that}", "remove", "{arguments}", "onRemoveComplete"] // fnName, fnArgs, eventName
        },
        removeAttachment: {
            funcName: "fluid.pouch.callPouchFunction",
            args: ["{that}", "removeAttachment", "{arguments}", "onRemoveAttachmentComplete"] // fnName, fnArgs, eventName
        },
        viewCleanup: {
            funcName: "fluid.pouch.callPouchFunction",
            args: ["{that}", "viewCleanup", "{arguments}", "onViewCleanupComplete"] // fnName, fnArgs, eventName
        }
    },
    listeners: {
        "onCreate.initPouch": {
            funcName: "fluid.pouch.init",
            args:     ["{that}"]
        }
    }
});
