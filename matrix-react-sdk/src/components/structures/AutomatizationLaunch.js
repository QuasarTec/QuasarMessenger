import React, { useState } from 'react'
import axios from 'axios';

export default function AutomatizationLaunch(_props){
    const apps = ['VkLead', 'Vkreg', 'InstaLead', 'SkypeLead', 'SkypeReg', 'TeleLead', 'VkConnect'];
    const [Error, setError] = useState(undefined);

    const handler = async(e) => {
        const { id } = e.target;
        
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
                let connect_payed = await axios.get(`https://matrix.easy-stars.ru/bot/users/check-on-payed?${query}`);

                if (connect_payed) {
                    window.ipcRenderer.send('launch_app', id);
                } 
                else {
                    setError(
                        <><p>Уважаемый пользователь, при запуске программы произошла ошибка. Это могло произойти по следующим причинам:<br/>
                        1) При регистрации в Quasar Message и на оф сайте компании вы должны были указать идентичный (одинаковый) логин и пароль. Убедитесь в том что данное правило Вами соблюдено<br/>
                        2) В личном кабинете, на оф. сайте компании, отсутствуют звезды:<br/>- Звезда "Бизнес франшиза". Без нее остальные звезды не активны и программы не запустятся. Партнерам ранее оплатившим "членский взнос", необходимо предоставить чек  подтверждение произведенной оплаты специалисту службы тех поддержки и активация данной звезды будет произведена<br/>- Проверьте наличие звезды запускаемой Вами программы, в своем личном кабинете на оф сайте компании <br/>
                        3) Если все рекомендации соблюдённые, обратитесь в службу тех поддержки для решения возникшей проблемы. найти ее Вы сможете в главном telegram боте компании и общедоступной комнате Quasar Message</p></>
                    )
                }
            }
        }
        else{
            setError(
                <><p>Уважаемый пользователь, при запуске программы произошла ошибка. Это могло произойти по следующим причинам:<br/>
                1) При регистрации в Quasar Message и на оф сайте компании вы должны были указать идентичный (одинаковый) логин и пароль. Убедитесь в том что данное правило Вами соблюдено<br/>
                2) В личном кабинете, на оф. сайте компании, отсутствуют звезды:<br/>- Звезда "Бизнес франшиза". Без нее остальные звезды не активны и программы не запустятся. Партнерам ранее оплатившим "членский взнос", необходимо предоставить чек  подтверждение произведенной оплаты специалисту службы тех поддержки и активация данной звезды будет произведена<br/>- Проверьте наличие звезды запускаемой Вами программы, в своем личном кабинете на оф сайте компании <br/>
                3) Если все рекомендации соблюдённые, обратитесь в службу тех поддержки для решения возникшей проблемы. найти ее Вы сможете в главном telegram боте компании и общедоступной комнате Quasar Message</p></>
            )
        }
    }

    return(
        <div className="mx_SocialMediaChoice">
            { Error && 
                <div className="mx_StarError">
                    <div className="mx_Error">
                        {Error}
                        <button onClick={ () => setError(undefined) }>OK</button>
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