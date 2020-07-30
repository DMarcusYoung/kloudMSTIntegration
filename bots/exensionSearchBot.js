const axios = require('axios');
const querystring = require('querystring');
const { TeamsActivityHandler, CardFactory } = require('botbuilder');

class ExtensionSearchBot extends TeamsActivityHandler {
    async handleTeamsMessagingExtensionQuery(context, query) {
        const searchQuery = query.parameters[0].value;
        try {
            const response = await axios.get(`http://registry.npmjs.com/-/v1/search?${ querystring.stringify({ text: searchQuery, size: 8 }) }`);
            const attachments = [];
            response.data.objects.forEach(obj => {
                const heroCard = CardFactory.heroCard(obj.package.name);
                const preview = CardFactory.heroCard(obj.package.name);
                preview.content.tap = { type: 'invoke', value: { description: obj.package.description } };
                const attachment = { ...heroCard, preview };
                attachments.push(attachment);
            });
            console.log(attachments)
    
            return {
                composeExtension: {
                    type: 'result',
                    attachmentLayout: 'list',
                    attachments: attachments
                }
            };
            
        } catch (e) {
            console.log(e)
            return
        }
    }

    async handleTeamsMessagingExtensionSelectItem(context, obj) {
        try {
            return {
                composeExtension: {
                    type: 'result',
                    attachmentLayout: 'list',
                    attachments: [CardFactory.thumbnailCard(obj.description)]
                }
            };
            
        } catch (e) {
            console.log(e)
            return
        }
    }
}


module.exports.ExtensionSearchBot = ExtensionSearchBot;