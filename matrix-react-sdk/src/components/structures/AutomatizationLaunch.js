import React from 'react'

export default function AutomatizationLaunch(_props){
    const apps = ['VkLead', 'InstaLead', 'SkypeLead', 'TeleLead'];

    const handler = e => {
        const { id } = e.target;

        window.ipcRenderer.send('launch_app', id);
    }

    return(
        <div className="mx_SocialMediaChoice">
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