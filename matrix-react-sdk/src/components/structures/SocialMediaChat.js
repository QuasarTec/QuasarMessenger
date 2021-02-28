import React, { Component, createRef } from 'react'
import objectDeepCompare from 'object-deep-compare'

export default class SocialMediaChat extends Component{
    constructor(props){
        super(props);

        this.state = {
            chat: null,
            isThrottling: false
        }

        this.chatRef = createRef();
    }

    async componentDidMount(){
        await this.initialMessageFetch();
    }

    async componentDidUpdate(prevProps){
        if(prevProps.chatId !== this.props.chatId){
            const { chatRef, initialMessageFetch } = this;
            
            chatRef.current.scrollTop = 0;
            await initialMessageFetch();
        }
    }

    initialMessageFetch = async() => {
        const { data, chatId } = this.props;
        const { id } = data.mail.msgs[chatId];

        await this.fetchDialog(id, false);
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

    shouldComponentUpdate(nextProps, nextState){
        const nextKeys = Object.keys(nextState.chat?.msgs || {});
        const currentKeys = Object.keys(this.state.chat?.msgs || {});

        const areSimilar = objectDeepCompare.CompareArrays(nextKeys, currentKeys);

        if(nextProps.chatId !== this.props.chatId || !this.state.chat || !areSimilar){
            return true
        }            

        return false
    }

    fetchDialog = async(id, shouldMerge) => {
        const { chat: stateChat } = this.state;
        const { data, chatId } = this.props;
        const { peerId } = data.mail.msgs[chatId];

        const response = await fetch('http://localhost:3000/vk/mail/dialog', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                peerId,
                msgId: id
            })
        });

        const chat = await response.json();
        const merged = { ...chat[0] };

        merged.msgs = shouldMerge ? { ...merged.msgs, ...stateChat?.msgs } : { ...merged.msgs }

        this.setState({
            chat: merged
        });
    }

    render(){
        const { chatRef, handleScroll } = this;
        const { chat } = this.state;
 
        if(chat){
            const { msgs: original, members } = chat;

            const { data, chatId } = this.props;
            const msgs = { ...original };
            msgs[chatId] = data.mail.msgs[chatId];

            const keys = Object.keys(msgs).reverse();

            return <div className='mx_SocialMediaChat' ref={ chatRef } onScroll={ handleScroll }>
                {
                    keys.map(id => {
                        const { text, authorId } = msgs[id];

                        return(
                            <div className='mx_Message' key={ id }>
                                <h2>{ members[authorId]?.firstName }</h2>
                                <p>{ text }</p>
                            </div>
                        )
                    })
                }

                <input className='mx_MessageComposer' type='text' name='message' placeholder='Сообщение' />
            </div>
        }
        else{
            return <div></div>
        }
    }
}