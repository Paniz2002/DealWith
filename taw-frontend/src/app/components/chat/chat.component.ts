import {Component, Input, OnInit} from '@angular/core';
import axios from 'axios';
import {environments} from '../../../environments/environments';
import {FormsModule} from '@angular/forms';
import {NotificationService} from '../../services/popup/notification.service';
import {DatePipe, NgClass} from '@angular/common';
import {
  MatExpansionPanel,
  MatExpansionPanelTitle,
  MatExpansionPanelHeader,
  MatExpansionPanelDescription
} from "@angular/material/expansion";
import {MatIcon} from "@angular/material/icon";

interface Message {
  canOperate?: boolean;
  id: string;
  author: string;
  content: string;
  receiver?: string;
  replyTo?: Message;
  created_at: string;
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
  imports: [FormsModule, NgClass, MatExpansionPanel, MatExpansionPanelTitle, MatExpansionPanelHeader, MatExpansionPanelDescription, MatIcon, DatePipe],
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit {

  constructor(private snackBar: NotificationService) {
  }

  @Input() isPrivate!: boolean; // Indica se la chat è privata
  @Input() auctionID!: string; // ID dell'asta
  @Input() auctionOwner!: string; // Proprietario dell'asta
  @Input() auctionOwnerID!: string; // ID del proprietario dell'asta
  @Input() whoAmI!: string; // Utente corrente
  editingMessage?: Message; // Message currently being edited
  editedContent: string = ''; // Stores the edited message content
  conversations: Conversation[] = []; // Lista delle conversazioni per il possessore
  isConversationListVisible: boolean = true; // Indica se la lista delle conversazioni è visibile
  noPrivateMessages: boolean = false; // Indica se non ci sono messaggi privati
  selectedConversation!: Conversation; // Conversazione selezionata
  newMessage: string = '';
  replyToMessageData?: Message; // Messaggio a cui si sta rispondendo

  ngOnInit() {
    if (this.isPrivate)
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
              const {_id, sender, text, receiver, inReplyTo} = data;

              const isMeSender = sender.username === this.whoAmI;
              const isMeReceiver = receiver.username === this.whoAmI;

              const mappedUser = isMeSender ? receiver.username : sender.username;
              const mappedUserID = isMeSender ? receiver._id : sender._id;

              if (!(isMeSender && isMeReceiver)) {
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
                    receiver: getRepliedMessage.receiver.username,
                    created_at: getRepliedMessage.createdAt
                  };
                }

                conversationsMap[mappedUser].messages.push({
                  canOperate: data.canOperate,
                  id: _id,
                  author: sender.username,
                  content: text,
                  receiver: receiver.username,
                  replyTo: repliedMessage,
                  created_at: data.createdAt
                });
              }
            }
          }

          this.conversations = Object.values(conversationsMap);
          if (this.conversations.length > 0) {
            this.noPrivateMessages = false;
            this.selectedConversation = this.conversations[defaultIndex];
          } else {
            this.noPrivateMessages = true;
          }
        }
        else {
          let messages: Message[] = [];

          for (const data of res.data.private_comments) {
            if (data.sender.username === this.whoAmI || data.receiver.username === this.whoAmI) {
              const {_id, sender, text, receiver, inReplyTo} = data;

              let repliedMessage: Message | undefined;
              if (inReplyTo) {
                const getRepliedMessage = res.data.private_comments.find((m: any) => m._id === inReplyTo._id);
                repliedMessage = {
                  canOperate: getRepliedMessage.canOperate,
                  id: getRepliedMessage._id,
                  author: getRepliedMessage.sender.username,
                  content: getRepliedMessage.text,
                  receiver: getRepliedMessage.receiver.username,
                  created_at: getRepliedMessage.createdAt
                };
              }

              messages.push({
                id: _id,
                author: sender.username,
                content: text,
                receiver: receiver.username,
                replyTo: repliedMessage,
                canOperate: data.canOperate,
                created_at: data.createdAt
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

        for (const data of res.data.public_comments) {
          const {_id, sender, text, inReplyTo, canOperate} = data;

          let repliedMessage: Message | undefined;
          if (inReplyTo) {
            const getRepliedMessage = res.data.public_comments.find((m: any) => m._id === inReplyTo._id);
            if (getRepliedMessage) {
              repliedMessage = {
                //  canOperate: getRepliedMessage.canOperate,
                id: getRepliedMessage._id,
                author: getRepliedMessage.sender.username,
                content: getRepliedMessage.text,
                created_at: getRepliedMessage.createdAt
              };
            }
          }

          messages.push({
            id: _id,
            author: sender.username,
            content: text,
            replyTo: repliedMessage,
            canOperate: canOperate,
            created_at: data.createdAt
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
      this.selectedConversation = {
        id: 'public',
        name: 'Public Chat',
        messages: []
      }
    }

  }

  private  buildParams (text:string,replyToId?: string)  {
    const isMeOwner = this.whoAmI === this.auctionOwner;
    return  {
      isPrivate: this.isPrivate ? true : null,
      text: text,
      receiver: this.isPrivate ? isMeOwner ? this.selectedConversation.receiver_id : this.auctionOwnerID : null,
      replyTo: replyToId || null,
    };
  }

  async sendMessage(replyToId?: string) {
    if (this.newMessage.trim() && this.selectedConversation) {
      try {
        const response = await axios.post(
          environments.BACKEND_URL + '/api/auctions/' + this.auctionID + '/comments',
          this.buildParams(this.newMessage.trim(), replyToId)
        );

        if (response.status === 200) {
          this.snackBar.notify('Message sent successfully');
          this.newMessage = '';
          this.replyToMessageData = undefined; // Reset reply data
        } else {
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
      element.scrollIntoView({behavior: 'smooth', block: 'center'});
    }
  }

  reloadPrivateChat(comment: any) {
    let conversationToFind = null;

    if (this.auctionOwner === this.whoAmI) {
      if (comment.receiver === this.auctionOwnerID) {
        conversationToFind = this.conversations.find((c) => c.id === comment.sender);
      } else {
        conversationToFind = this.conversations.find((c) => c.id === comment.receiver);
      }
    }

    let index = 0;
    // find index of conversation
    if (conversationToFind)
      index = this.conversations.indexOf(conversationToFind);

    this.loadPrivateConversations(index);

  }

  reloadPublicChat() {
    this.loadPublicConversations();
  }

  deleteComment(id: string) {
    axios.delete(environments.BACKEND_URL + '/api/auctions/' + this.auctionID + '/comments/' + id).then((res) => {
      if (res.status === 200) {
        this.snackBar.notify('Comment deleted successfully');
      } else {
        this.snackBar.notify('Error deleting comment');
      }
    }).catch(error => {
      this.snackBar.notify('Error deleting comment');
      console.error('Error deleting comment', error);
    })

  }

  async saveEdit(replyToId?: string) {
    if (this.editingMessage && this.newMessage.trim()) {
      try {
        const response = await axios.put(
          `${environments.BACKEND_URL}/api/auctions/${this.auctionID}/comments/${this.editingMessage.id}`,
          this.buildParams(this.newMessage.trim(),replyToId)
        );

        if (response.status === 200) {
          this.snackBar.notify('Message updated successfully');
          this.editingMessage.content = '';
          this.cancelEdit(); // Clear editing state
        } else {
          this.snackBar.notify('Error updating message');
        }
      } catch (error) {
        console.error('Error updating message:', error);
        this.snackBar.notify('Error updating message');
      }
    }
  }

  editMessage(message: Message) {
    if(message.replyTo) {
      this.replyToMessageData = message.replyTo;
    }

    this.editingMessage = message;
    this.newMessage= message.content;
  }

  cancelEdit() {
    this.replyToMessageData = undefined;
    this.editingMessage = undefined;
    this.newMessage = '';
    this.editedContent = '';
  }

}
