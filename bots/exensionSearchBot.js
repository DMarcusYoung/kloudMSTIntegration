const axios = require('axios');
const querystring = require('querystring');
const { TeamsActivityHandler, CardFactory } = require('botbuilder');

class ExtensionSearchBot extends TeamsActivityHandler {
    async handleTeamsMessagingExtensionQuery(context, query) {
        const searchQuery = query.parameters[0].value;
        try {
            const docList = await axios.get('https://api.peertime.cn/peertime/V1/SpaceAttachment/List?spaceID=370&type=0&pageIndex=0&pageSize=15', {
                headers: {
                    UserToken: 'aa398b9f-65bc-4855-8fd3-c88aea9d6955'
                }
            })
            const attachments = [];
            const parsedDocs = JSON.parse(docList.data.substr(1)).RetData.DocumentList;
            parsedDocs.forEach(obj => {
                const heroCard = CardFactory.heroCard(obj.Title);
                const preview = CardFactory.heroCard(obj.Title);
                // preview.content.tap = { type: 'invoke', value: { description: obj.package.description } };
                // const attachment = { ...heroCard, preview };
                const attachment = { ...heroCard };
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