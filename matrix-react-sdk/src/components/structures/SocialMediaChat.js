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
        //this.chatRef.current.addEventListener('scroll', this.handleScroll, false);
        await this.fetchDialog();
    }

    componentWillUnmount(){
        //this.chatRef.current.removeEventListener('scroll', this.handleScroll, false);
    }

    handleScroll = e => {
        const { isThrottling } = this.state;

        if(!isThrottling){
            this.setState({
                isThrottling: true
            });
    
            setTimeout(async() => {
                const { scrollHeight, scrollTop, clientHeight } = e.target;
    
                if(scrollHeight - scrollTop === clientHeight){
                    console.log('bottom');
                    // const updatedOffset = chatOffset + 20;
    
                    // const chatsRes = await fetch('http://localhost:3000/vk/mail', {
                    //     method: 'POST',
                    //     headers: {
                    //         'Content-Type': 'application/json'
                    //     },
                    //     body: JSON.stringify({
                    //         offset: updatedOffset
                    //     })
                    // });
    
                    // const chats = await chatsRes.json();
                    // loadChats(chats[0], updatedOffset);
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

        const areDifferent = objectDeepCompare.CompareArrays(nextKeys, currentKeys);
        console.log(areDifferent);

        if(nextProps.chatId !== this.props.chatId || !this.state.chat || areDifferent){
            console.log(nextKeys, currentKeys);
            return true
        }            

        return false
    }

    async componentDidUpdate(){
        console.log('update');
        await this.fetchDialog();
    }

    fetchDialog = async() => {
        const { data, chatId } = this.props;
        const { peerId, id } = data.mail.msgs[chatId];

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

        this.setState({
            chat: chat[0],
        });
    }

    render(){
        const clone = { ...this.state };
        const { chat } = clone;

        if(chat){
            const { msgs, members } = chat;

            const { data, chatId } = this.props;
            msgs[chatId] = data.mail.msgs[chatId];

            const keys = Object.keys(msgs);

            return <div className='mx_SocialMediaChat' ref={ this.chatRef }>
                {
                    keys.map(id => {
                        const { text, authorId } = msgs[id];

                        return(
                            <div className='mx_Message' key={ id }>
                                <h2>{ members[authorId].firstName }</h2>
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