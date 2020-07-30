const { TeamsActivityHandler, CardFactory } = require('botbuilder');
const axios = require ('axios');

class ExtensionActionBot extends TeamsActivityHandler {
    handleTeamsMessagingExtensionSubmitAction(context, action) {
        switch(action.commandId){
            case 'startMeeting':
                return this.startMeeting(context, action)
            case 'syncRooms':
                return this.syncRooms(context, action)
            case 'listDocs':
                return this.listDocs(context, action)
            default: 
                throw new Error('Not Implemented')
        }
    }

    startMeeting = (context, action) => {
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

    syncRooms = () => {
        const syncRoomList = [
            { name: 'Room 1', url: 'https://kloud.com' },
            { name: 'Room 2', url: 'https://us.kloud.com/join' },
            { name: 'Room 3', url: 'https://us.kloud.com/register' },
        ]
        const actions = [];
        syncRoomList.forEach(el => actions.push({ title: el.name, type: 'Action.OpenUrl', url: el.url }))
        const adaptiveCard = CardFactory.adaptiveCard({
            actions,
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

    listDocs = async (context, action) => {
        const docList = await axios.get('https://api.peertime.cn/peertime/V1/SpaceAttachment/List?spaceID=370&type=0&pageIndex=0&pageSize=15', {
            headers: {
                UserToken: 'aa398b9f-65bc-4855-8fd3-c88aea9d6955'
            }
        })
        const parsedDocs = JSON.parse(docList.data.substr(1)).RetData.DocumentList;
        const buttons = []
        parsedDocs.forEach(el => buttons.push({ type: 'openUrl', title: el.Title, value: `https://kloud.cn/docview/${el.ItemID}` }))
        buttons.push({ type: 'openUrl', title: 'My Doc', value: `https://kloud.cn/docview/1981415` })
        const heroCard = CardFactory.heroCard('Documents', '', [], buttons);
        heroCard.content.subtitle = action.data.subTitle;
        const attachment = { contentType: heroCard.contentType, content: heroCard.content, preview: heroCard };
        const heroCard2 = CardFactory.heroCard('Another Card', '', []);
        heroCard2.content.subtitle = action.data.subTitle;
        const attachment2 = {contentType: heroCard2.contentType, content: heroCard2.content, preview: heroCard2 };
    
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

module.exports.ExtensionActionBot = ExtensionActionBot;