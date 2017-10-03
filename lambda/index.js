'use strict';

// Close the dialog with the customer, reporting fulfillmentState of Failed or Fulfilled ("Thanks, your pizza will arrive in 20 minutes")
function close(sessionAttributes, fulfillmentState, message) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'Close',
            fulfillmentState,
            message: {
                contentType: "PlainText",
                content: message
            }
        },
    };
}

// Close dialog with the customer, reporting fulfillmentState of Failed or Fulfilled ("Thanks, your pizza will arrive in 20 minutes")
function delegate(sessionAttributes, slots) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'Delegate',
            slots: slots
        },
    };
}

function elicitSlot(sessionAttributes, intentName, slots, slotToElicit, message) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'ElicitSlot',
            intentName: intentName,
            slots: slots,
            slotToElicit: slotToElicit,
            message: {
                contentType: "PlainText",
                content: message
            }
        }
    }

}


// --------------- Events -----------------------

function dispatch(intentRequest, callback) {
    console.log('request received for userId=' + intentRequest.userId + ',  intentName=' + intentRequest.currentIntent.name);
    const sessionAttributes = intentRequest.sessionAttributes;
    const slots = intentRequest.currentIntent.slots;
    var bookingDate = slots.bookingdate;
    var bookingTime = slots.bookingtime;
    var numberOfPeople = slots.numberofpeople;
    var restaurantName = slots.restaurantname;

    if (intentRequest.currentIntent.name === 'reservetable') {
        if (bookingDate === null) {
            callback(delegate(sessionAttributes, slots));
        }
        if (bookingDate !== null && bookingTime === null) {
            //validate reserve date is future
            var reserveDate = new Date(bookingDate);
            var currDate = new Date();
            if (reserveDate >= currDate) {
                callback(delegate(sessionAttributes, slots));
            } else {
                callback(elicitSlot(sessionAttributes, 'reservetable', slots, 'bookingdate', 'Reserve date should be a future or todays date! What date you want me to book a table ?'));
            }
        }

        if (numberOfPeople === null) {
            callback(delegate(sessionAttributes, slots));

        }

        if (restaurantName === null && (numberOfPeople < 0 || numberOfPeople > 6)) {
            callback(elicitSlot(sessionAttributes, 'reservetable', slots, 'numberofpeople', 'You can book for upto 6 people at a time! For How many people you want me to book the table (1-6) ?'));
        } else if (restaurantName === null && numberOfPeople <= 6) {
            callback(delegate(sessionAttributes, slots));
        }

        if (restaurantName !== null) {
            //validate restaurant name
            //TODO - Make a call to Dynamo DB to validate booking and confirm transaction.

            //confirm booking
            callback(close(sessionAttributes, 'Fulfilled', "I have booked your table on " + bookingDate + " " + bookingTime + " at " + restaurantName + " for " + numberOfPeople + " seats. Your confirmation number is A34FG. Thank you!"));
        }


    }

    console.log('request received for Slots=' + bookingDate + ',' + bookingTime + ',' + numberOfPeople + ',' + restaurantName);
}

// --------------- Main handler -----------------------

// Route the incoming request based on intent.
// The JSON body of the request is provided in the event slot.
exports.handler = (event, context, callback) => {
    try {
        dispatch(event,
            (response) => {
                callback(null, response);
            });
    } catch (err) {
        callback(err);
    }
};
