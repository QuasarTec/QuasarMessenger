import React, { Component } from 'react'
import Accounts from './Accounts';
import Chats from './Chats';
import SocialMediaChat from './SocialMediaChat'
import SocialMediaLogin from './SocialMediaLogin'

export default class SocialMedia extends Component{
    constructor(props){
        super(props);

        this.state = {
            chatId: undefined,
            accountIndex: 0,
            chatOffset: 0,
            vk: [],
            addNewAccount: false
        }

        this.updateInterval = null;
    }

    componentDidMount(){
        this.updateInterval = setInterval(async() => {
            const { vk, accountIndex } = this.state;
            const account = vk[accountIndex];

            if(account?.activity){
                const updates = await fetch('http://localhost:8000/vk/activity/check', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(account.activity)
                });

                const json = await updates.json();
                console.log(json);
            }
        }, 5000);
    }

    componentWillUnmount(){
        clearInterval(this.updateInterval);
    }

    setClient = client => {
        const { name } = this.props;
        const clone = { ...this.state };

        clone[name].push(client);
        clone.accountIndex = clone[name].length - 1;
        clone.addNewAccount = false;

        this.setState(clone);
    }

    loadChats = (chat, offset) => {;
        const clone = { ...this.state }
        const { name } = this.props;
        const { accountIndex } = clone;
        const { msgs, members, peers } = chat;

        const merged = { ...clone[name][accountIndex].mail };

        merged.msgs = { ...merged.msgs, ...msgs };
        merged.members = { ...merged.members, ...members }
        merged.peers = { ...merged.peers, ...peers }

        clone.chatOffset = offset;
        clone[name][accountIndex].mail = merged;
        
        this.setState(clone);
    }

    createClient = () => {
        this.setState({
            addNewAccount: true
        });
    }

    changeProp = (e, propName) => {
        const data = {};
        const { index } = e.target.dataset;

        try{
            data[propName] = parseInt(index);
        }
        catch{
            data[propName] = 0;
        }
        
        this.setState(data);
    }

    render(){
        const { setClient, createClient, changeProp, loadChats, state, props } = this;
        const { addNewAccount, accountIndex, chatId, chatOffset } = state;
        const { name } = props;

        if(state[name].length === 0 || addNewAccount){
            return <SocialMediaLogin setClient={ setClient } />
        }

        else if(state[name].length !== 0){
            const { mail, activity } = state[name][accountIndex];

            return(
                <div className="mx_SocialMedia">
                    <Accounts accounts={ state[name] } 
                              createClient={ createClient }
                              changeIndex={ changeProp }
                              currentIndex={ accountIndex }/>

                    <Chats chats={ mail }
                           activity={ activity }
                           name={ name }
                           changeId={ changeProp }
                           loadChats={ loadChats }
                           chatOffset={ chatOffset }
                           currentIndex={ accountIndex }/>

                    { chatId && <SocialMediaChat name={ name } 
                                                 data={ state[name][accountIndex] }
                                                 chatId={ chatId } /> }
                </div>
            )
        }

        return <SocialMediaLogin />
    }
}