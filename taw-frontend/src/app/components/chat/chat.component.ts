import { Component, Input, OnInit } from '@angular/core';
import axios from 'axios';
import { environments } from '../../../environments/environments';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/popup/notification.service';
import { NgClass } from '@angular/common';

interface Message {
  id: string;
  author: string;
  content: string;
  receiver?: string;
  replyTo?: Message;
}

interface Conversation {
  id: string;
  name: string; // Nome dell'utente o ID della conversazione
  receiver_id?: string; // ID del destinatario
  messages: Message[];
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  standalone: true,
  imports: [FormsModule, NgClass],
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  constructor(private snackBar: NotificationService) {}

  @Input() isPrivate!: boolean; // Indica se la chat è privata
  @Input() auctionID!: string; // ID dell'asta
  @Input() auctionOwner!: string; // Proprietario dell'asta
  @Input() auctionOwnerID!: string; // ID del proprietario dell'asta
  @Input() whoAmI!: string; // Utente corrente
  conversations: Conversation[] = []; // Lista delle conversazioni per il possessore
  selectedConversation!: Conversation; // Conversazione selezionata
  newMessage: string = '';
  replyToMessageData?: Message; // Messaggio a cui si sta rispondendo

  ngOnInit() {
    if(this.isPrivate)
      this.loadPrivateConversations();
    else
      this.loadPublicConversations();
  }

  loadPrivateConversations() {
    try {
      axios.get(
        environments.BACKEND_URL + '/api/auctions/' + this.auctionID + '/comments',
        {
          params: {
            isPrivate: true,
          },
        }
      ).then((res) => {

        console.log('loading private conversations');

        if (this.whoAmI === this.auctionOwner) {
          const conversationsMap: { [key: string]: Conversation } = {};
          for (const data of res.data.private_comments) {
            if (data.sender.username === this.whoAmI || data.receiver.username === this.whoAmI) {
              const { _id, sender, text, receiver, inReplyTo } = data;

              const isMeSender = sender.username === this.whoAmI;
              const isMeReceiver = receiver.username === this.whoAmI;

              const mappedUser = isMeSender ? receiver.username : sender.username;
              const mappedUserID = isMeSender ? receiver._id : sender._id;

              if(!(isMeSender && isMeReceiver)) {
                if (!conversationsMap[mappedUser]) {
                  conversationsMap[mappedUser] = {
                    id: mappedUser,
                    name: mappedUser,
                    receiver_id: mappedUserID,
                    messages: []
                  };
                }

                let repliedMessage: Message | undefined;
                if (inReplyTo) {
                  const getRepliedMessage = res.data.private_comments.find((m: any) => m._id === inReplyTo._id);
                  repliedMessage = {
                    id: getRepliedMessage._id,
                    author: getRepliedMessage.sender.username,
                    content: getRepliedMessage.text,
                    receiver: getRepliedMessage.receiver.username
                  };
                }

                conversationsMap[mappedUser].messages.push({
                  id: _id,
                  author: sender.username,
                  content: text,
                  receiver: receiver.username,
                  replyTo: repliedMessage
                });
              }
            }
          }

          this.conversations = Object.values(conversationsMap);
          if (this.conversations.length > 0) {
            this.selectedConversation = this.conversations[0]; // Seleziona la prima conversazione di default
          }
        } else {
          let messages: Message[] = [];

          for (const data of res.data.private_comments) {
            if (data.sender.username === this.whoAmI || data.receiver.username === this.whoAmI) {
              const { _id, sender, text, receiver, inReplyTo } = data;

              let repliedMessage: Message | undefined;
              if (inReplyTo) {
                const getRepliedMessage = res.data.private_comments.find((m: any) => m._id === inReplyTo._id);
                repliedMessage = {
                  id: getRepliedMessage._id,
                  author: getRepliedMessage.sender.username,
                  content: getRepliedMessage.text,
                  receiver: getRepliedMessage.receiver.username
                };
              }

              messages.push({
                id: _id,
                author: sender.username,
                content: text,
                receiver: receiver.username,
                replyTo: repliedMessage
              });
            }
          }
          this.conversations = [{
            id: this.whoAmI,
            name: this.whoAmI,
            messages: messages
          }];

          this.selectedConversation = this.conversations[0];
        }
      });


    } catch (error) {
      console.error('Error loading private conversations:', error);
    }
  }

  loadPublicConversations() { // Carica le conversazioni pubbliche
    try {
      axios.get(
        environments.BACKEND_URL + '/api/auctions/' + this.auctionID + '/comments'
      ).then((res) => {
        let messages: Message[] = [];

        for(const data of res.data.public_comments){
          const { _id, sender, text, inReplyTo } = data;

          let repliedMessage: Message | undefined;
          if (inReplyTo) {
            const getRepliedMessage = res.data.public_comments.find((m: any) => m._id === inReplyTo._id);
            repliedMessage = {
              id: getRepliedMessage._id,
              author: getRepliedMessage.sender.username,
              content: getRepliedMessage.text
            };
          }

          messages.push({
            id: _id,
            author: sender.username,
            content: text,
            replyTo: repliedMessage
          });

        }

        this.selectedConversation = {
          id: 'public',
          name: 'Public Chat',
          messages: messages
        }
        console.log('selected conversation public', this.selectedConversation);
      });


    } catch (error) {
      console.error('Error loading public conversations:', error);
    }
  }


  async sendMessage(replyToId?: string) {
    if (this.newMessage.trim() && this.selectedConversation) {


      try {
        const isMeOwner = this.whoAmI === this.auctionOwner;

        const params = {
          isPrivate: this.isPrivate ? true : null,
          text: this.newMessage,
          receiver: this.isPrivate ? isMeOwner ? this.selectedConversation.receiver_id : this.auctionOwnerID : null,
          replyTo: replyToId || null,
        };

        console.log(params);

        const response = await axios.post(
          environments.BACKEND_URL + '/api/auctions/' + this.auctionID + '/comments',
          params
        );

        if (response.status === 200) {
          this.snackBar.notify('Message sent successfully');
          this.newMessage = '';
          // Aggiungi il nuovo messaggio alla conversazione selezionata
          this.selectedConversation.messages.push({
            id: response.data._id,
            author: this.whoAmI,
            content: this.newMessage,
            receiver: this.selectedConversation.name,
            replyTo: this.replyToMessageData
          });
          this.replyToMessageData = undefined; // Reset reply data
        }else{
          this.snackBar.notify('Error sending message');
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  }

  replyToMessage(message: Message) {
    this.replyToMessageData = message;
  }

  cancelReply() {
    this.replyToMessageData = undefined;
  }

  selectConversation(conversation: Conversation) {
    this.selectedConversation = conversation;
  }

  scrollToMessage(messageId: string | undefined) {
    if (!messageId) return;
    const element = document.getElementById(messageId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  reloadChat(comment: any) {

    if(comment.private === true)
      this.loadPrivateConversations();
    else{
      this.loadPublicConversations();
    }

  }
}
