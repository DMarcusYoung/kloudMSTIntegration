// This is only the server code. The manifest.json has the info on how the app should behave on teams,
// Local tunneling hosted by ngrok, app studio on MST has important configuation settings   
var restify = require('restify');
var builder = require('botbuilder');
var util = require("util");
var teams = require('botbuilder-teams');
const axios = require('axios')

const { BotFrameworkAdapter, TeamsActivityHandler, CardFactory } = require('botbuilder');
const { title } = require('process');

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
        switch(action.commandId){
            case 'startMeeting':
                return startMeeting(context, action)
            case 'syncRoom':
                return syncRoom(context, action)
            case 'listDocs':
                return listDocs(context, action)
            default: 
                throw new Error('Not Implemented')
        }
    }
}

function startMeeting(context, action){
    const data = action.data;
    const heroCard = CardFactory.heroCard(data.title, '', [], [{
        "type": "openUrl",
        "title": "Start Meeting",
        "value": "kloud.cn/kloud/documents"
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

function syncRoom(context, action){
    const syncRoomList = [
        { name: 'Room 1', url: 'https://kloud.com' },
        { name: 'Room 2', url: 'https://us.kloud.com/join' },
        { name: 'Room 3', url: 'https://us.kloud.com/register' },
    ]
    // const choices = [];
    // syncRoomList.forEach(el => choices.push({ title: el.name, value: el.name }))
    const actions = [];
    syncRoomList.forEach(el => actions.push({ title: el.name, type: 'Action.OpenUrl', url: el.url }))
    const adaptiveCard = CardFactory.adaptiveCard({
        actions,
        // body: [
        //   { text: 'Sync Rooms', type: 'TextBlock', weight: 'bolder'},
        //   { choices, id: 'MultiSelect', style: 'expanded', type: 'Input.ChoiceSet' },
        // ],
        type: 'AdaptiveCard',
        version: '1.0'
      });

      return {
        task: {
          type: 'continue',
          value: {
            card: adaptiveCard,
            height: 450,
            title: 'Sync Room List',
            url: null,
            width: 500
          }
        }
      };
}

const listDocs = async (context, action) => {
    const docList = await axios.get('https://api.peertime.cn/peertime/V1/SpaceAttachment/List?spaceID=370&type=0&pageIndex=0&pageSize=15', {
        headers: {
            UserToken: 'aa398b9f-65bc-4855-8fd3-c88aea9d6955'
        }
    })
    console.log(docList.data);
    const documentList = [
        { name: 'Document 1', url: 'https://kloud.com' },
        { name: 'Document 2', url: 'https://us.kloud.com/join' },
        { name: 'Document 3', url: 'https://kloud.cn/docview/1980757' },
    ]
    const buttons = []
    documentList.forEach(el => buttons.push({ type: 'openUrl', title: el.name, value: el.url }))
    const heroCard = CardFactory.heroCard('Documents', '', [], buttons);
    heroCard.content.subtitle = action.data.subTitle;
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

const bot = new TeamsMessagingExtensionsActionBot();
// const inMemoryStorage = new builder.MemoryBotStorage();
// const chatBot = new builder.UniversalBot(adapter).set('storage', inMemoryStorage);

// var stripBotAtMentions = new teams.StripBotAtMentions();
// chatBot.use(stripBotAtMentions);

// chatBot.dialog('/', [
//     function (session) {
//         builder.Prompts.text(session, 'Hi! What is your name?');
//     },
//     function (session, results) {
//         session.endDialog(`Hello ${results.response}!`);
//     }
// ]);

class TeamsConversationBot extends TeamsActivityHandler {
    constructor() {
        super();
        this.onMessage(async (context, next) => {
            TurnContext.removeRecipientMention(context.activity);
            const text = context.activity.text.trim().toLocaleLowerCase();
            if (text.includes('start')) {
                await this.startActivityAsync(context);
            } else if (text.includes('join')) {
                await this.joinActivityAsync(context, true);
            } else if (text.includes('help')) {
                await this.helpActivityAsync(context);
            } else if (text.includes('logout')) {
                await this.logoutActivityAsync(context);
            } else {
                await this.cardActivityAsync(context, false);
            }
        });
    }

    async cardActivityAsync(context, isUpdate) {
        const cardActions = [
            {
                type: ActionTypes.MessageBack,
                title: 'Message all members',
                value: null,
                text: 'MessageAllMembers'
            },
            {
                type: ActionTypes.MessageBack,
                title: 'Who am I?',
                value: null,
                text: 'whoami'
            },
            {
                type: ActionTypes.MessageBack,
                title: 'Delete card',
                value: null,
                text: 'Delete'
            }
        ];

        if (isUpdate) {
            await this.sendUpdateCard(context, cardActions);
        } else {
            await this.sendWelcomeCard(context, cardActions);
        }
    }

    async sendUpdateCard(context, cardActions) {
        const data = context.activity.value;
        data.count += 1;
        cardActions.push({
            type: ActionTypes.MessageBack,
            title: 'Update Card',
            value: data,
            text: 'UpdateCardAction'
        });
        const card = CardFactory.heroCard(
            'Updated card',
            `Update count: ${ data.count }`,
            null,
            cardActions
        );
        card.id = context.activity.replyToId;
        const message = MessageFactory.attachment(card);
        message.id = context.activity.replyToId;
        await context.updateActivity(message);
    }

    async sendWelcomeCard(context, cardActions) {
        const initialValue = {
            count: 0
        };
        cardActions.push({
            type: ActionTypes.MessageBack,
            title: 'Update Card',
            value: initialValue,
            text: 'UpdateCardAction'
        });
        const card = CardFactory.heroCard(
            'Welcome card',
            '',
            null,
            cardActions
        );
        await context.sendActivity(MessageFactory.attachment(card));
    }

    async startActivityAsync(context) {
        context.sendActivity(MessageFactory.text('Meeting started!'));
    }

    async joinActivityAsync(context) {
        context.sendActivity(MessageFactory.text('Meeting joined!'));

    }

    async helpActivityAsync(context) {
        context.sendActivity(MessageFactory.text('Help found!'));

    }

    async logoutActivityAsync(context) {
        context.sendActivity(MessageFactory.text('Lougout initiated.'));
    }
}

const botBetter = new TeamsConversationBot();

const server = restify.createServer();
server.listen(3978, function () {
    console.log('%s listening to %s', server.name, util.inspect(server.address()));
});

server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        await bot.run(context);
    });
});