// This File is currently just a reference to a deprecated tutorial

var request = require('request');
var util = require("util");
var restify = require('restify');
var builder = require('botbuilder');
var teams = require('botbuilder-teams');

var connector = new teams.TeamsChatConnector({
    // appId: "8867f929-d0b0-4164-b8e8-46a0b2d59e3f",
    // appPassword: "AX264_-7Q1z.F7~yZX-1PfBh.WjV_-d431"
    appId: "758bb218-c046-43f1-809b-a627157f0d90",
    appPassword: "H6-lorHb5x8_cq2dlNq1-InyI9h1.F.~CT"
});

var server = restify.createServer();

server.listen(3978, function () {
    console.log('%s listening to app2 %s', server.name, util.inspect(server.address()));
});
var inMemoryStorage = new builder.MemoryBotStorage();
var bot = new builder.UniversalBot(connector).set('storage', inMemoryStorage);

var stripBotAtMentions = new teams.StripBotAtMentions();
bot.use(stripBotAtMentions);

bot.dialog('/', [
    function (session) {
        builder.Prompts.text(session, 'Hi! What is your name?');
    },
    function (session, results) {
        session.endDialog(`Hello ${results.response}!`);
    }
]);

// this will reset and allow to receive from any tenants
connector.resetAllowedTenants();

// var bot = new builder.UniversalBot(connector);

server.post('/api/composeExtension', connector.listen());
server.post('/api/messages', connector.listen());
// server.post('/greetings', connector.listen());
server.post('/', connector.listen());

var composeExtensionHandler = function (event, query, callback) {
    // parameters should be identical to manifest
    console.log("Query Running");
    
    var attachments = [];
    try {
        var card = new builder.HeroCard()
        .buttons([{
            type: "openUrl",
            title: "Open Kloud",
            value: 'kloud.com'
        }]);
        
        attachments.push(card.toAttachment());
        
        
    } catch (err) {
        console.log(err);
    }
    
    
    var response = teams.ComposeExtensionResponse
        .result('list')
        .attachments(attachments)
        .toResponse();

    // Send the response to teams
    callback(null, response, 200);

        //}

};

connector.onQuery('Open', composeExtensionHandler);

var composeInvoke = function (event) {
    console.log(event);
};


connector.onInvoke(composeExtensionHandler);