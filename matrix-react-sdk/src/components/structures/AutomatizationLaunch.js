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
                    let Icon, img;

                    try{
                        img = require(`../../../res/img/automatization/${app}.png`);
                        Icon = () => <img src={ img } />
                    }
                    catch{
                        Icon = () => <p>{ app }</p>
                    }

                    return(
                        <button id={ app }
                                className={ img ? 'fixed' : '' }
                                style={ img ? { padding: '0' } : {} }
                                onClick={ handler } 
                                key={ app }>
                            <Icon />
                        </button>
                    )
                })
            }
        </div>
    )
}