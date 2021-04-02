import React, { useState } from 'react'
import axios from 'axios';

export default function AutomatizationLaunch(_props){
    const apps = ['VkLead', 'Vkreg', 'InstaLead', 'SkypeLead', 'SkypeReg', 'TeleLead', 'VkConnect'];
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
            let dev = false;
            if(result.Stars[id] || result.Stars[`${id} Business`] || result.Stars[`${id}Soft`] || dev){
                window.ipcRenderer.send('launch_app', id);
                
            }
            else{
                let connect_payed = await axios.get(`https://matrix.easy-stars.ru/bot/users.check-on-payed?${query.by_text}`)
                if (connect_payed) {
                    window.ipcRenderer.send('launch_app', id);
                } else {
                    setError(`Уважаемый пользователь, при запуске программы произошла ошибка. Это могло произойти по следующим причинам:\n\n1) При регистрации в Quasar Message и на оф сайте компании вы должны были указать идентичный (одинаковый) логин и пароль. Убедитесь в том что данное правило Вами соблюдено\n\n2) В личном кабинете, на оф. сайте компании, отсутствуют звезды:\n\n- Звезда "Бизнес франшиза". Без нее остальные звезды не активны и программы не запустятся. Партнерам ранее оплатившим "членский взнос", необходимо предоставить чек  подтверждение произведенной оплаты специалисту службы тех поддержки и активация данной звезды будет произведена\n\n- Проверьте наличие звезды запускаемой Вами программы, в своем личном кабинете на оф сайте компании \n\n3) Если все рекомендации соблюдённые, обратитесь в службу тех поддержки для решения возникшей проблемы. найти ее Вы сможете в главном telegram боте компании и общедоступной комнате Quasar Message`);
                }
            }
        }
        else{
            setError(`Уважаемый пользователь, при запуске программы произошла ошибка. Это могло произойти по следующим причинам:\n\n1) При регистрации в Quasar Message и на оф сайте компании вы должны были указать идентичный (одинаковый) логин и пароль. Убедитесь в том что данное правило Вами соблюдено\n\n2) В личном кабинете, на оф. сайте компании, отсутствуют звезды:\n\n- Звезда "Бизнес франшиза". Без нее остальные звезды не активны и программы не запустятся. Партнерам ранее оплатившим "членский взнос", необходимо предоставить чек  подтверждение произведенной оплаты специалисту службы тех поддержки и активация данной звезды будет произведена\n\n- Проверьте наличие звезды запускаемой Вами программы, в своем личном кабинете на оф сайте компании \n\n3) Если все рекомендации соблюдённые, обратитесь в службу тех поддержки для решения возникшей проблемы. найти ее Вы сможете в главном telegram боте компании и общедоступной комнате Quasar Message\n\n4) Попробуйте перезайти в аккаунт мессенджера`);
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