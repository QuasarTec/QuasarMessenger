import React, { useState } from 'react'

export default function AutomatizationLaunch(_props){
    const apps = ['VkLead', 'Vkreg', 'InstaLead', 'SkypeLead', 'SkypeReg', 'TeleLead'];
    const [error, setError] = useState('');

    const handler = async(e) => {
        const { id } = e.target;

        console.log(localStorage.getItem('username'));
        
        const query = stringify({
            token: 'D!3&#!@aidaDHAI(I*12331231AKAJJjjjho1233h12313^%#%@4112dhas91^^^^31',
            action: 'get',
            by: 'username',
            by_text: localStorage.getItem('username')
        });

        const res = await fetch(`https://api.easy-stars.ru/api/query/stars?${query}`);
        const stars = await res.json();

        const { result, status } = stars;

        if(status === 'successful'){
            let dev = true;
            if(result.Stars[id] || result.Stars[`${id} Business`] || result.Stars[`${id}Soft`] || dev){
                window.ipcRenderer.send('launch_app', id);
            }
            else{
                setError('У вас нет данного товара');
            }
        }
        else{
            setError('Что-то пошло не так, обратитесь в тех. поддержку');
        }
    }

    return(
        <div className="mx_SocialMediaChoice">
            { error && 
                <div className="mx_StarError">
                    <div className="mx_Error">
                        <p>{ error }</p>
                        <button onClick={ () => setError('') }>OK</button>
                    </div>
                </div>
            }

            {
                apps.map(app => {
                    return(
                        <button id={ app }
                                onClick={ handler } 
                                key={ app }>
                            <img className="mx_AutoImg" src={ require(`../../../res/img/automatization/${app}.png`) } />
                        </button>
                    )
                })
            }
        </div>
    )
}

const stringify = data => {
    const result = [];

    for (const prop in data) {
        if (data.hasOwnProperty(prop)) {
            result.push(encodeURIComponent(prop) + "=" + encodeURIComponent(data[prop]));
        }
    }

    return result.join("&");
}