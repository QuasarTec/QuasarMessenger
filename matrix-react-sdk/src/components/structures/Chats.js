import React, { useState, useRef, useEffect } from 'react'

export default function Chats(props){
    const [isFetching, setFetching] = useState(false);

    const chatRef = useRef();
    let isThrottling = false;

    const trackScrollUpdate = e => {
        if(!isThrottling){
            const { chatOffset, loadChats } = props;
            isThrottling = true;

            setTimeout(async() => {
                const { scrollHeight, scrollTop, clientHeight } = e.target;

                if(scrollHeight - scrollTop === clientHeight){
                    const updatedOffset = chatOffset + 20;

                    const chatsRes = await fetch('http://localhost:8000/vk/mail', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            offset: updatedOffset
                        })
                    });

                    const chats = await chatsRes.json();
                    loadChats(chats[0], updatedOffset);
                }

                isThrottling = false;
            }, 1000);
        }
    }

    useEffect(() => {
        if(chatRef && chatRef.current){
            const { current } = chatRef;

            current.addEventListener('scroll', trackScrollUpdate, false);
            return () => current.removeEventListener('scroll', trackScrollUpdate, false);
        }
    }, [props]);

    const { name, chats, changeId } = props;

    const handleChatClick = e => {
        if(!isFetching){
            setFetching(true);
            changeId(e, 'chatId');
            setFetching(false);
        }
    }

    if(name === 'vk'){
        const { msgs, members, peers } = chats;
        const IDs = Object.keys(msgs).reverse();

        return(
            <div className='mx_Chats' ref={ chatRef }>
                {
                    IDs.map(id => {
                        const { text, peerId } = msgs[id];

                        if(members[peerId]){
                            const { raw_name, avatar } = members[peerId];
                            const httpRegex = /http/;

                            return(
                                <div className='mx_Chat' 
                                     onClick={ handleChatClick } 
                                     data-index={ id }
                                     key={ id }
                                >
                                    <img src={ httpRegex.test(avatar) ? avatar : 'https://vk.com/' + avatar } /> 
    
                                    <div className='mx_ChatInfo'>
                                        <p className='mx_Name'>{ raw_name }</p>
                                        <p className='mx_Message'>{ text }</p>
                                    </div>
                                </div>
                            )
                        }
                        else if(peers[peerId]){
                            const { title, avatarImages } = peers[peerId];

                            return(
                                <div className='mx_Chat' 
                                     onClick={ handleChatClick } 
                                     data-index={ id }
                                     key={ id }>

                                    <img src={ avatarImages?.[0] || 'https://st6-22.vk.com/images/mobile/skins/avatar/no_avatar_2x.png' } />
    
                                    <div className='mx_ChatInfo'>
                                        <p className='mx_Name'>{ title }</p>
                                        <p className='mx_Message'>{ text }</p>
                                    </div>
                                </div>
                            )
                        }
                    })
                }
            </div>
        )
    }

    else <div>Chats</div>
}