import React from 'react';
import medias from '../../interfaces/SocialMedia';

export default function SocialMediaChoice(props) {
    const handler = e => {
        const { id } = e.target;

        props.changeSocialMedia({
            name: id,
        });
    };

    return (
        <div className="mx_SocialMediaChoice">
            {
                Object.keys(medias).map(key => {
                    const media = medias[key];
                    return (
                        <button className={ media }
                            id={ media }
                            onClick={ handler }
                            key={ media }>
                            <img src={ require(`../../../res/img/social/${media}.png`) } />
                        </button>
                    );
                })
            }
        </div>
    );
}
