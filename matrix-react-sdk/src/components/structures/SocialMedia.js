import React, { Component } from 'react'
import { MatrixClientPeg } from "../../MatrixClientPeg";
import SocialMediaChat from './SocialMediaChat'
import LoginLinks from './auth/LoginLinks'
import VkLogin from './VkLogin'

export default class SocialMedia extends Component{
    constructor(props){
        super(props);

        this.state = {
            data: null,
            vk: null
        }
    }

    componentDidMount(){
        const res = {
            vk: []
        }

        this.setState({
            data: res
        });
    }

    setClient = client => {
        this.setState(client);
    }

    encodeParams = (initial, obj) => {
        let edited = initial;

        for (var key in obj) {
            if (edited != "") {
                edited += "&";
            }
            edited += key + "=" + encodeURIComponent(obj[key]);
        }

        return edited
    }

    render(){
        const { data } = this.state;
        const { name, shouldAuthOpen } = this.props;

        const cli = MatrixClientPeg.get();

        if(data && (!data[name] || data[name].length === 0) && shouldAuthOpen){
            if(name === 'vk'){
                const link = LoginLinks.vk;

                const options = {
                    client_id: '7765905',
                    scope: 'messages',
                    response_type: 'token'
                }

                const authLink = this.encodeParams(link, options);
                window.ipcRenderer.send('open_window', authLink);
            }
        }
        else if(data && data[name] && data[name].length !== 0){
            return <SocialMediaChat />
        }

        return <VkLogin setClient={ this.setClient }/>
    }
}