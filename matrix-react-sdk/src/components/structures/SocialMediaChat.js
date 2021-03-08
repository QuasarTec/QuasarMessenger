import React, { Component, createRef } from 'react'
import MessageComposer from './MessageComposer'
import objectDeepCompare from 'object-deep-compare'
import api_domain from '../../domains/api'

export default class SocialMediaChat extends Component{
    constructor(props){
        super(props);

        this.state = {
            chat: null,
            isThrottling: false,
            hash: ''
        }

        this.chatRef = createRef();
    }

    async componentDidMount(){
        await this.initialMessageFetch();
    }

    async componentDidUpdate(prevProps){
        if(prevProps.chatId !== this.props.chatId){
            const { chatRef, initialMessageFetch } = this;
            
            if(chatRef.current) chatRef.current.scrollTop = 0;
            await initialMessageFetch();
        }
    }

    shouldComponentUpdate(nextProps, nextState){
        const nextKeys = Object.keys(nextState.chat?.msgs || {});
        const currentKeys = Object.keys(this.state.chat?.msgs || {});

        const areSimilar = objectDeepCompare.CompareArrays(nextKeys, currentKeys);

        if(nextProps.chatId !== this.props.chatId 
            || !this.state.chat 
            || !areSimilar 
            || this.state.hash !== nextState.hash)
        {
            return true
        }            

        return false
    }

    initialMessageFetch = async() => {
        const { data, chatId } = this.props;
        const { id } = data.mail.msgs[chatId];

        await this.fetchDialog(id, false);
    }

    getSendHash = async(chat) => {
        const { cookie } = this.props;
        const { peerId } = chat.cur; 

        const response = await fetch(`${api_domain}/vk/mail/hash`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cookie,
                peerId
            })
        });

        const data = await response.json();
        return data.hash
    }

    handleScroll = e => {
        const { isThrottling, chat } = this.state;
        const clone = { ...e };

        if(!isThrottling){
            this.setState({
                isThrottling: true
            });
    
            setTimeout(async() => {
                const { scrollHeight, scrollTop, clientHeight } = clone.target;

                if(scrollHeight + scrollTop === clientHeight){
                    const { msgs } = chat; 
                    const firstMessage = Object.keys(msgs)[0];

                    await this.fetchDialog(firstMessage, true);
                }
    
                this.setState({
                    isThrottling: false
                });
            }, 1000);
        }
    }

    fetchDialog = async(id, shouldMerge) => {
        const { chat: stateChat } = this.state;
        const { data, chatId, cookie } = this.props;
        const { peerId } = data.mail.msgs[chatId];

        const response = await fetch(`${api_domain}/vk/mail/dialog`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cookie,
                peerId,
                msgId: id
            })
        });

        const chat = await response.json();
        const hash = await this.getSendHash(chat[0]);
        const merged = { ...chat[0] };

        if(shouldMerge){
            merged.msgs = { ...merged.msgs, ...stateChat?.msgs }
            merged.members = { ...merged.members, ...stateChat?.members }
            merged.forwards = { ...merged.forwards, ...stateChat?.forwards }
        }

        merged.msgs[chatId] = data.mail.msgs[chatId];

        this.setState({
            chat: merged,
            hash
        });
    }

    render(){
        const { chatRef, handleScroll } = this;
        const { chat, hash } = this.state;

        if(chat){
            const { msgs, members, forwards } = chat;

            const keys = Object.keys(msgs).reverse();
            const imgRegex = /url\((.*)\)/;

            return <div className='mx_SocialMediaChat' ref={ chatRef } onScroll={ handleScroll }>
                {
                    keys.map(id => {
                        const { text, authorId, attachesHTML, forwards: forwardsMsgs } = msgs[id];
                        const img = imgRegex.exec(attachesHTML)?.[1];

                        return(
                            <div className='mx_Message' key={ id }>
                                <h2>{ members?.[authorId]?.firstName }</h2>
                                <p>{ text }</p>
                                { img && <img src={ img }/> }

                                { forwardsMsgs.length !== 0 && 
                                    <div className="mx_Forward">
                                        {
                                            forwardsMsgs.map(forward => {
                                                const { authorId: forwardId, text: nestedText, attachesHTML: nestedHtml } = forwards[forward];
                                                const nestedImg = imgRegex.exec(nestedHtml)?.[1];

                                                return(
                                                    <div className="mx_ForwardedMessage" key={ forward }>
                                                        <h2>{ members?.[forwardId]?.firstName }</h2>
                                                        <p>{ nestedText }</p>
                                                        { nestedImg && <img src={ nestedImg }/> }
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                }
                            </div>
                        )
                    })
                }
                
                <MessageComposer hash={ hash } cur={ chat.cur } cookie={ this.props.cookie }/>
            </div>
        }
        else{
            return <div></div>
        }
    }
}