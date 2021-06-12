import React, { FC } from 'react';

interface Props {
    setWebsiteLink: (link: string) => void
}

interface Button {
    url: string,
    iconPath: string,
    name: string
}

const buttons: Button[] = [
    {
        url: 'https://easy-stars.ru/',
        iconPath: require('../../../../res/img/links/site.jpg'),
        name: 'EasyStars',
    },
    {
        url: 'https://qtconnect.ru/',
        iconPath: require('../../../../res/img/links/connect.png'),
        name: 'Connect',
    },
];

const Highlighted: FC<Props> = ({ setWebsiteLink }: Props) => {
    return (
        <div className="highlited">
            { buttons.map(({ url, iconPath, name }) => (
                <button key={name} onClick={ () => setWebsiteLink(url) }>
                    <img src={iconPath} />
                    <p>{name}</p>
                </button>
            )) }
        </div>
    )
};

export default Highlighted;
