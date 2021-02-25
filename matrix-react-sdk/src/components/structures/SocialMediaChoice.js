import React from 'react'

export default function SocialMediaChoice(props){
    const medias = ['telegram', 'instagram', 'vk'];
    
    const handler = e => {
        const { id } = e.target;

        props.changeSocialMedia({
            name: id
        });
    }

    return(
        <div className="mx_SocialMediaChoice">
            {
                medias.map(media => {
                    return(
                        <button className={ media } 
                                id={ media } 
                                onClick={ handler } 
                                key={ media }>
                            <img src={ require(`../../../res/img/social/${media}.png`) } />
                        </button>
                    )
                })
            }
        </div>
    )
}