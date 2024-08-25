import { Component, Input, OnInit } from '@angular/core';
import axios from 'axios';
import { environments } from '../../../environments/environments';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/popup/notification.service';
import { NgClass } from '@angular/common';
import {
  MatExpansionPanel,
  MatExpansionPanelTitle,
  MatExpansionPanelHeader,
  MatExpansionPanelDescription
} from "@angular/material/expansion";
import {MatIcon} from "@angular/material/icon";

interface Message {
  canOperate: boolean;
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
  imports: [FormsModule, NgClass, MatExpansionPanel, MatExpansionPanelTitle, MatExpansionPanelHeader, MatExpansionPanelDescription, MatIcon],
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit {

  constructor(private snackBar: NotificationService) {}

  @Input() isPrivate!: boolean; // Indica se la chat è privata
  @Input() auctionID!: string; // ID dell'asta
  @Input() auctionOwner!: string; // Proprietario dell'asta
  @Input() auctionOwnerID!: string; // ID del proprietario dell'asta
  @Input() whoAmI!: string; // Utente corrente
  conversations: Conversation[] = []; // Lista delle conversazioni per il possessore
  isConversationListVisible: boolean = true; // Indica se la lista delle conversazioni è visibile
  noPrivateMessages: boolean = false; // Indica se non ci sono messaggi privati
  selectedConversation!: Conversation; // Conversazione selezionata
  newMessage: string = '';
  replyToMessageData?: Message; // Messaggio a cui si sta rispondendo

  ngOnInit() {
    if(this.isPrivate)
      this.loadPrivateConversations(0);
    else
      this.loadPublicConversations();
  }

  loadPrivateConversations(defaultIndex: number) {
    try {
      axios.get(
        environments.BACKEND_URL + '/api/auctions/' + this.auctionID + '/comments',
        {
          params: {
            isPrivate: true,
          },
        }
      ).then((res) => {

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
                    id: mappedUserID,
                    name: mappedUser,
                    receiver_id: mappedUserID,
                    messages: []
                  };
                }

                let repliedMessage: Message | undefined;
                if (inReplyTo) {
                  const getRepliedMessage = res.data.private_comments.find((m: any) => m._id === inReplyTo._id);
                  repliedMessage = {
                    canOperate: getRepliedMessage.canOperate,
                    id: getRepliedMessage._id,
                    author: getRepliedMessage.sender.username,
                    content: getRepliedMessage.text,
                    receiver: getRepliedMessage.receiver.username
                  };
                }

                conversationsMap[mappedUser].messages.push({
                  canOperate: data.canOperate,
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
            this.noPrivateMessages = false;
            this.selectedConversation = this.conversations[defaultIndex];
          }else{
            this.noPrivateMessages = true;
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
                  canOperate: getRepliedMessage.canOperate,
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
                replyTo: repliedMessage,
                canOperate: data.canOperate
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
              canOperate: getRepliedMessage.canOperate,
              id: getRepliedMessage._id,
              author: getRepliedMessage.sender.username,
              content: getRepliedMessage.text
            };
          }

          messages.push({
            id: _id,
            author: sender.username,
            content: text,
            replyTo: repliedMessage,
            canOperate: data.canOperate
          });

        }

        this.selectedConversation = {
          id: 'public',
          name: 'Public Chat',
          messages: messages
        }
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
            canOperate:response.data.canOperate,
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

  reloadPrivateChat(comment: any) {
    let conversationToFind = null;

    if(this.auctionOwner === this.whoAmI) {
      if(comment.receiver === this.auctionOwnerID) {
        conversationToFind = this.conversations.find((c) => c.id === comment.sender);
      }else{
        conversationToFind = this.conversations.find((c) => c.id === comment.receiver);
      }
    }

    let index = 0;
    // find index of conversation
    if(conversationToFind)
      index = this.conversations.indexOf(conversationToFind);

    this.loadPrivateConversations(index);

  }

  reloadPublicChat() {
    this.loadPublicConversations();
  }

}
