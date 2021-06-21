import React from 'react';
import api_domain from '../../domains/api';

export default function MessageComposer(props) {
    const handleSend = e => {
        const { key, target } = e;
        const { value } = target;

        if (key === 'Enter' && value !== '') {
            const { hash, cur, cookie } = props;
            const { _af, peerId, groupId } = cur;

            fetch(`${api_domain}/vk/mail/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    _af,
                    hash,
                    to: peerId,
                    from: groupId ? '' : 'dialog',
                    message: value,
                    cookie,
                }),
            });

            target.value = '';
        }
    };

    return (
        <input className='mx_MessageComposer'
               type='text'
               onKeyDown={ handleSend }
               name='message'
               placeholder='Сообщение' />
    );
}
