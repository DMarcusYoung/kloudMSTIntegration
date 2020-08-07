const { TeamsActivityHandler, TurnContext, CardFactory, ActionTypes, MessageFactory } = require('botbuilder');

class ConversationBot extends TeamsActivityHandler {

    constructor() {
        super();
        // var msg = new builder.Message().address(address);
        // msg.text("Hewwo! I'm OwO bot");
        // bot.send(msg);
        this.onTypingActivity(async (context, next) => {
            context.sendActivity(MessageFactory.text("Hewwo! I'm OwO bot"));
        });
        this.onMessage(async (context, next) => {
            TurnContext.removeRecipientMention(context.activity);
            const text = context.activity.text.trim().toLocaleLowerCase();
            switch(text){
                case 'start':
                    return this.startActivityAsync(context);
                case 'join':
                    return this.joinActivityAsync(context, true);
                case 'help':
                    return this.helpActivityAsync(context);
                case 'logout':
                    return this.logoutActivityAsync(context);
                default: 
                    return this.cardActivityAsync(context, false);
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
        try {
            if (isUpdate) {
                await this.sendUpdateCard(context, cardActions);
            } else {
                await this.sendWelcomeCard(context, cardActions);
            }
        } catch (e) {
            console.log(e)
            return
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
        try {
            context.sendActivity(MessageFactory.text('Meeting started!'));
        } catch (e) {
            console.log(e)
            return
        }
    }

    async joinActivityAsync(context) {
        try {
            context.sendActivity(MessageFactory.text('Meeting joined!'));
        } catch (e) {
            console.log(e)
            return
        }

    }

    async helpActivityAsync(context) {
        try {
            context.sendActivity(MessageFactory.text('1. start - start a personal meeting \n' +
            '2. join (meeting ID) - join a specific meeting\n' + 
            '3. logout - logout of your account'));
        } catch (e) {
            console.log(e)
            return
        }

    }

    async logoutActivityAsync(context) {
        try {
            context.sendActivity(MessageFactory.text('Logout initiated.'));
        } catch (e) {
            console.log(e)
            return
        }
    }
}

module.exports.ConversationBot = ConversationBot;