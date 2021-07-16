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
        url: 'https://www.google.com/',
        iconPath: require('../../../../res/img/links/google.jpg'),
        name: 'google',
    },
    {
        url: 'https://quasaria.ru/',
        iconPath: require('../../../../res/img/links/site.jpg'),
        name: 'EasyStars',
    },
    {
        url: 'https://qtconnect.ru/',
        iconPath: require('../../../../res/img/links/connect.png'),
        name: 'Connect',
    },
    {
      // eslint-disable-next-line max-len
      url: 'https://ru.wikipedia.org/wiki/%D0%97%D0%B0%D0%B3%D0%BB%D0%B0%D0%B2%D0%BD%D0%B0%D1%8F_%D1%81%D1%82%D1%80%D0%B0%D0%BD%D0%B8%D1%86%D0%B0',
      iconPath: require('../../../../res/img/links/wikipedia.png'),
      name: 'Wikipedia',
    },
    {
        url: 'https://rucaptcha.com/',
        iconPath: require('../../../../res/img/links/rucaptcha.png'),
        name: 'ruCaptcha',
    },
    {
        url: 'https://vk.com/',
        iconPath: require('../../../../res/img/social/vk.png'),
        name: 'vk',
    },
    {
        url: 'https://web-telegram.ru',
        iconPath: require('../../../../res/img/social/telegram.png'),
        name: 'telegram',
    },
    {
        url: 'https://web.whatsapp.com/',
        iconPath: require('../../../../res/img/links/whatsapp.png'),
        name: 'whatsapp',
    },
    {
        url: 'https://www.youtube.com/channel/UClOU3ZVqiUXTBAG_uONlOjg',
        iconPath: require('../../../../res/img/links/youtube.png'),
        name: 'youtube',
    },
    {
        url: 'https://qiwi.com',
        iconPath: require('../../../../res/img/links/qiwi.png'),
        name: 'qiwi',
    },
    {
        url: 'https://payeer.com/ru/',
        iconPath: require('../../../../res/img/links/payeer.png'),
        name: 'payeer',
    },
    {
        url: 'https://yoomoney.ru',
        iconPath: require('../../../../res/img/links/yoomoney.png'),
        name: 'yoomoney',
    },
];

const DefaultLinks: FC<Props> = ({ setWebsiteLink }: Props) => (
    <div className="mx_SocialMediaChoice">
        { buttons.map(({ url, iconPath, name }) => (
            <button key={name} onClick={ () => setWebsiteLink(url) }>
                <img src={iconPath} />
            </button>
        )) }
    </div>
);

export default DefaultLinks;
