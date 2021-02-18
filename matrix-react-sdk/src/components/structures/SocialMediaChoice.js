import React from 'react'

export default function SocialMediaChoice(props){
    const medias = ['Telegram', 'Instagram', 'VK'];
    
    const handler = e => {
        const { id } = e.target;
        const lowerCase = id.toLowerCase();

        props.changeSocialMedia({
            name: lowerCase
        });
    }

    return(
        <div className="mx_SocialMediaChoice">
            {
                medias.map(media => {
                    return(
                        <button id={ media } onClick={ handler } key={ media }>
                            { media }
                        </button>
                    )
                })
            }
        </div>
    )
}