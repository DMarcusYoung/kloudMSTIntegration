var restify = require('restify');
var builder = require('botbuilder');
var util = require("util");
var teams = require('botbuilder-teams');

const { BotFrameworkAdapter, TeamsActivityHandler, CardFactory } = require('botbuilder');

const adapter = new BotFrameworkAdapter({
    appId: "758bb218-c046-43f1-809b-a627157f0d90",
    appPassword: "H6-lorHb5x8_cq2dlNq1-InyI9h1.F.~CT"
});

adapter.onTurnError = async (context, error) => {
    // This check writes out errors to console log .vs. app insights.
    // NOTE: In production environment, you should consider logging this to Azure
    //       application insights. See https://aka.ms/bottelemetry for telemetry 
    //       configuration instructions.
    console.error(`\n [onTurnError] unhandled error: ${ error }`);

    // Send a trace activity, which will be displayed in Bot Framework Emulator
    await context.sendTraceActivity(
        'OnTurnError Trace',
        `${ error }`,
        'https://www.botframework.com/schemas/error',
        'TurnError'
    );

    // Send a message to the user
    await context.sendActivity('The bot encountered an error or bug.');
    await context.sendActivity('To continue to run this bot, please fix the bot source code.');
};  

class TeamsMessagingExtensionsActionBot extends TeamsActivityHandler {
    handleTeamsMessagingExtensionSubmitAction(context, action) {
        const data = action.data;
        // const heroCard = CardFactory.media(['Kloud.com']);
        // console.log(heroCard.contentType)
        // const attachment = { contentType: heroCard.contentType, content: heroCard, preview: heroCard };
        const heroCard = CardFactory.heroCard(data.title, 'Kloud.com', [], [{
            "type": "openUrl",
            "title": "Go To website",
            "value": "https://kloud.com"
          },]);
        heroCard.content.subtitle = data.subTitle;
        const attachment = { contentType: heroCard.contentType, content: heroCard.content, preview: heroCard };

        return {
            composeExtension: {
                type: 'result',
                attachmentLayout: 'list',
                attachments: [
                attachment
                ]
            }
        }
    }
}

const bot = new TeamsMessagingExtensionsActionBot();

const server = restify.createServer();
server.listen(3978, function () {
    console.log('%s listening to %s', server.name, util.inspect(server.address()));
});
// var inMemoryStorage = new builder.MemoryBotStorage();
// var bot = new builder.UniversalBot(connector).set('storage', inMemoryStorage);

// this will reset and allow to receive from any tenants
// connector.resetAllowedTenants();

// var bot = new builder.UniversalBot(connector);

// server.post('/api/composeExtension', connector.listen());
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        await bot.run(context);
    });
});
// server.post('/api/messages', connector.listen());
// server.post('/', connector.listen());

// var composeExtensionHandler = function (event, query, callback) {
//     // parameters should be identical to manifest
//     console.log("Query Running");

//     var attachments = [];
//         try {
//             var card = new builder.HeroCard()
//                 .buttons([{
//                     type: "openUrl",
//                     title: "Open Kloud",
//                     value: 'kloud.com'
//                 }]);

//             attachments.push(card.toAttachment());


//         } catch (err) {
//             console.log(err);
//         }


//         var response = teams.ComposeExtensionResponse
//             .result('list')
//             .attachments(attachments)
//             .toResponse();

//         // Send the response to teams
//         callback(null, response, 200);


//         //}

// };

// connector.onQuery('Open', composeExtensionHandler);

// var composeInvoke = function (event) {
//     console.log(event);
// };


// connector.onInvoke('composeInvoke');