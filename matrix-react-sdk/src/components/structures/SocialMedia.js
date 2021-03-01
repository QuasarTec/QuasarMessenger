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
    }

    componentDidMount(){
        const res = {
            vk: []
        }

        this.setState(res);
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
        const { msgs, members } = chat;

        const merged = { ...clone[name][accountIndex].mail };

        merged.msgs = { ...merged.msgs, ...msgs };
        merged.members = { ...merged.members, ...members }

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

        if((state[name] === undefined || state[name].length === 0) || addNewAccount){
            return <SocialMediaLogin setClient={ setClient } />
        }

        else if(state[name].length !== 0){
            return(
                <div className="mx_SocialMedia">
                    <Accounts accounts={ state[name] } 
                              createClient={ createClient }
                              changeIndex={ changeProp }
                              currentIndex={ accountIndex }/>

                    <Chats chats={ state[name][accountIndex].mail }
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