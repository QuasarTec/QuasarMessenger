import React, { Component } from 'react'
import Accounts from './Accounts';
import Chats from './Chats';
import SocialMediaChat from './SocialMediaChat'
import SocialMediaLogin from './SocialMediaLogin'
import api_domain from '../../domains/api'
import objectDeepCompare from 'object-deep-compare'
import { MatrixClientPeg } from "../../MatrixClientPeg";

export default class SocialMedia extends Component{
    constructor(props){
        super(props);

        this.state = {
            chatId: undefined,
            accountIndex: 0,
            chatOffset: 0,
            vk: [],
            auth: [],
            addNewAccount: false,
            updates: {}
        }

        this.updateInterval = null;
    }

    async componentDidMount(){
        await this.getCookieFromDB();

        this.updateInterval = setInterval(async() => {
            const { vk, accountIndex, updates, auth } = this.state;
            const account = vk[accountIndex];

            if(account?.activity){
                const activity = await fetch(`${api_domain}/vk/activity/check`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ ...account.activity, cookie: auth[accountIndex] })
                });

                const json = await activity.json();
                const comparison = objectDeepCompare.CompareValuesWithConflicts(json, updates);
                
                if(json.updates.length !== 0 && comparison.length !== 0){
                    await this.fetchOnUpdate();

                    this.setState({
                        updates: json
                    });
                }
                return
            }
            return
        }, 3000);
    }

    componentWillUnmount(){
        clearInterval(this.updateInterval);
    }

    getInitialData = async(cookie) => {
        const chatsRes = await fetch(`${api_domain}/vk/mail`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cookie,
                offset: 0
            })
        });
        let chats;

        try{
            chats = await chatsRes.json();
        }
        catch{
            return { err: 'login' };
        }

        const accountDataRes = await fetch(`${api_domain}/vk/account_data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cookie })
        });
        const accountData = await accountDataRes.json();

        const activityRes = await fetch(`${api_domain}/vk/mail/activity`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cookie })
        });
        const activityData = await activityRes.json();

        const response = {
            profile: accountData,
            activity: activityData,
            mail: chats[0]
        }

        return this.setClient(response, cookie);
    }

    getCookieFromDB = async() => {
        const { userId } = MatrixClientPeg.get().credentials;
        const { name } = this.props;

        const res = await fetch('https://matrix.easy-stars.ru/api/db/get', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: userId,
                name
            })
        });

        const cookies = await res.json();

        if(cookies.cookie){
            for(const cookie of cookies.cookie){
                const initial = await this.getInitialData(cookie);
    
                if(initial?.err === 'login'){
                    await fetch('https://matrix.easy-stars.ru/api/db/remove', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            cookie
                        })
                    });
                }
            }
        }
    }

    async fetchOnUpdate(){
        const { chatOffset, chatId, accountIndex, auth } = this.state;

        const chatsRes = await fetch(`${api_domain}/vk/mail`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cookie: auth[accountIndex],
                offset: 0
            })
        });

        const chats = await chatsRes.json();
        this.loadChats(chats[0], chatId ? chatOffset : 0);
    }

    setClient = (client, cookie) => {
        const { name } = this.props;
        const clone = { ...this.state };

        clone[name].push(client);
        clone.auth.push(cookie);
        clone.addNewAccount = false;

        this.setState(clone);
    }

    loadChats = (chat, offset) => {;
        const clone = { ...this.state }
        const { name } = this.props;
        const { accountIndex } = clone;
        const { msgs, members, peers } = chat;

        const merged = { ...clone[name][accountIndex].mail };

        for(const msg in msgs){
            const { peerId } = msgs[msg];

            for(const originalMsg in merged.msgs){
                if(peerId === merged.msgs[originalMsg].peerId){
                    if(originalMsg === clone.chatId.toString()){
                        clone.chatId = msg;
                    }

                    delete merged.msgs[originalMsg];
                }
            }
        }

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

        if(propName === 'accountIndex') data.chatId = undefined
        
        this.setState(data);
    }

    render(){
        const { createClient, changeProp, loadChats, getInitialData, state, props } = this;
        const { addNewAccount, accountIndex, chatId, chatOffset, auth } = state;
        const { name } = props;

        if((state[name] === undefined || state[name].length === 0) || addNewAccount){
            return <SocialMediaLogin getInitialData={ getInitialData }
                                     accountIndex={ state[name].length }
                                     name={ name } />
        }
        else if(state[name].length !== 0){
            const { mail, activity } = state[name][accountIndex];

            return(
                <div className="mx_SocialMedia">
                    <Accounts accounts={ state[name] } 
                              createClient={ createClient }
                              changeIndex={ changeProp }
                              cookie={ auth[accountIndex] }
                              currentIndex={ accountIndex }/>

                    <Chats chats={ mail }
                           activity={ activity }
                           name={ name }
                           changeId={ changeProp }
                           loadChats={ loadChats }
                           chatOffset={ chatOffset }
                           currentIndex={ accountIndex }
                           cookie={ auth[accountIndex] }/>

                    { chatId && <SocialMediaChat name={ name } 
                                                 data={ state[name][accountIndex] }
                                                 cookie={ auth[accountIndex] }
                                                 chatId={ chatId } /> }
                </div>
            )
        }

        return <div />
    }
}