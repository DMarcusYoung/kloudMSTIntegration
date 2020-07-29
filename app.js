// This is only the server code. The manifest.json has the info on how the app should behave on teams,
// Local tunneling hosted by ngrok, app studio on MST has important configuation settings   
const restify = require('restify');
const util = require("util");
// const teams = require('botbuilder-teams');
const { BotFrameworkAdapter } = require('botbuilder');
// const { title } = require('process');
const { ExtensionBot } = require('./bots/extensionBot');
const { ConversationBot } = require('./bots/conversationBot');


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

const extensionBot = new ExtensionBot();
const conversationBot = new ConversationBot();

const server = restify.createServer();
server.listen(3978, function () {
    console.log('%s listening to %s', server.name, util.inspect(server.address()));
});

server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        await extensionBot.run(context);
        await conversationBot.run(context);
    });
});