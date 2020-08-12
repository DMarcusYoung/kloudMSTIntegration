const { TeamsActivityHandler, CardFactory } = require('botbuilder');
const axios = require ('axios');

class ExtensionActionBot extends TeamsActivityHandler {
    handleTeamsMessagingExtensionSubmitAction(context, action) {
        switch(action.commandId){
            case 'syncRooms':
                return this.syncRooms()
            case 'listDocs':
                if(action.data.id) return this.listDocs()
                else return this.createHeroCard(context, action)
            default: 
                throw new Error('Not Implemented')
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

    listDocs = async () => {
        const docList = await axios.get('https://api.peertime.cn/peertime/V1/SpaceAttachment/List?spaceID=370&type=0&pageIndex=0&pageSize=15', {
            headers: {
                UserToken: 'aa398b9f-65bc-4855-8fd3-c88aea9d6955'
            }
        })
        const parsedDocs = JSON.parse(docList.data.substr(1)).RetData.DocumentList;
        const choices = [];
        parsedDocs.forEach(el => choices.push({title: el.Title, value: `${el.Title}https://kloud.cn/docview/${el.ItemID}`}))
        const adaptiveCard = CardFactory.adaptiveCard({
            body:[
                {
                    type: "TextBlock",
                    text: "Select a Document and Press Open"
                 },
                {
                    type: "Input.ChoiceSet",
                    id: "SingleSelectVal",
                    style: "expanded",
                    value: "1",
                    choices
                },
            ],
            actions:[
                {
                    title: 'Open',
                    type: 'Action.Submit',
                    url: 'kloud.com'
                }
            ],
            type: 'AdaptiveCard',
            version: '1.0'
          });
        
        return {
            task: {
                type: 'continue',
                value: {
                  card: adaptiveCard,
                  height: 450,
                  title: 'Document List',
                  url: null,
                  width: 500
                }
            }
        }
    }

    createHeroCard = (context, action) => {
        const data = action.data.SingleSelectVal
        const title = data.slice(0, data.indexOf('https'))
        const url = data.slice(data.indexOf('https'))
        const heroCard = CardFactory.heroCard(`Doc Name: ${title}`, '', [], [{
            "type": "openUrl",
            "title": "Open Document",
            "value": url
            },]);
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

module.exports.ExtensionActionBot = ExtensionActionBot;